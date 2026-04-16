/**
 * @file RecommendationLogic.ts
 * @description 2-Step Decision Support System (Personality-to-Profession & Lifestyle-to-University)
 */

export interface IRecommendationResult {
  dept_id: number;
  uni_name: string;
  dept_name: string;
  city_name: string;
  match_score: number;
  explanations: string[];
}

export class RecommendationEngine {
  private readonly WEIGHTS = {
    lifestyle: 0.40, 
    academic: 0.40,  
    financial: 0.20  
  };

  /**
   * ANA FONKSİYON: Tablolardan gelen verileri işler.
   */
  public calculate(
    userProfile: any, 
    userScores: any, 
    departments: any[]
  ): IRecommendationResult[] {
    
    // Güvenlik: Veri eksikse boş dön, sistemi patlatma
    if (!userProfile || !userScores || !departments) return [];

    return departments.map(dept => {
      const explanations: string[] = [];

      // 1. ŞEHİR UYUMU (User_Test_Scores + Cities)
      const lifestyleScore = this.calculateLifestyleScore(userScores, dept.university.city, explanations);

      // 2. AKADEMİK UYUM (User_Profiles + Departments)
      const academicScore = this.calculateAcademicScore(userProfile.exam_rank, dept.base_rank, explanations);

      // 3. EKONOMİK UYUM (User_Profiles + Cities)
      const financialScore = this.calculateFinancialScore(userProfile.financial_status, dept.university.city.total_cost_index, explanations);

      // Toplam Ağırlıklı Puan
      const totalScore = 
        (lifestyleScore * this.WEIGHTS.lifestyle) +
        (academicScore * this.WEIGHTS.academic) +
        (financialScore * this.WEIGHTS.financial);

      return {
        dept_id: dept.id,
        uni_name: dept.university.uni_name,
        dept_name: dept.dept_name,
        city_name: dept.university.city.city_name,
        match_score: Math.round(totalScore),
        explanations: [...new Set(explanations)] // Tekrar edenleri temizle
      };
    });
  }

  // --- PRIVATE HELPER METHODS  ---

  private calculateLifestyleScore(scores: any, city: any, expl: string[]): number {
    // Nisa'nın culture_w, nature_w vb. verilerini şehrin puanlarıyla çarpıyoruz
    const rawMatch = 
      (scores.culture_w * city.culture_score) +
      (scores.nature_w * city.nature_score) +
      (scores.social_w * city.social_score) +
      (scores.modern_w * city.modern_score);

    const score = (rawMatch / 20) * 100; // 5 üzerinden 4 kategori max 20 yapar.
    if (score >= 75) expl.push(`${city.city_name} şehri yaşam tarzı beklentilerini fazlasıyla karşılıyor.`);
    return score;
  }

  private calculateAcademicScore(studentRank: number, baseRank: number, expl: string[]): number {
    if (!studentRank || !baseRank) return 0;
    if (studentRank <= baseRank) {
      expl.push("Sıralamanız bu bölüm için oldukça güvenli.");
      return 100;
    }
    if (studentRank <= baseRank * 1.25) {
      expl.push("Sıralamanız sınırda ancak şansınız var.");
      return 60;
    }
    return 10;
  }

  private calculateFinancialScore(status: string, costIndex: number, expl: string[]): number {
    // Nisa'nın financial_status (Düşük, Orta, Yüksek) verisine göre şehir maliyeti kontrolü
    if (status === 'Yüksek') return 100;
    if (status === 'Orta' && costIndex <= 3) return 100;
    if (status === 'Düşük' && costIndex <= 2) {
      expl.push("Ekonomik olarak sizi yormayacak bir şehir tercihi.");
      return 100;
    }
    expl.push("Şehir maliyeti bütçenizi biraz zorlayabilir.");
    return 40;
  }
}