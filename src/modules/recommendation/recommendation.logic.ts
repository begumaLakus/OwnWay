/**
 * @file RecommendationLogic.ts
 * @description Decimal-Safe 2-Step Decision Support System
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

  public calculate(
    userProfile: any, 
    userScores: any, 
    departments: any[]
  ): IRecommendationResult[] {
    
    if (!userProfile || !userScores || !departments) return [];

    return departments.map(dept => {
      const explanations: string[] = [];

      // 1. ŞEHİR UYUMU (Decimal Dönüşümü Yapıldı)
      const lifestyleScore = this.calculateLifestyleScore(userScores, dept.university.city, explanations);

      // 2. AKADEMİK UYUM (Sıralama kontrolü)
      // Not: userProfile içinde sıralama alanı adını kontrol et (exam_rank?)
      const academicScore = this.calculateAcademicScore(userProfile.exam_rank, dept.base_rank, explanations);

      // 3. EKONOMİK UYUM
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
        explanations: [...new Set(explanations)]
      };
    });
  }

  // --- PRIVATE HELPER METHODS ---

  private calculateLifestyleScore(scores: any, city: any, expl: string[]): number {
    // 🔥 KRİTİK DÜZELTME: Decimal değerleri Number'a çeviriyoruz
    const cW = Number(scores.culture_w || 0);
    const nW = Number(scores.nature_w || 0);
    const sW = Number(scores.social_w || 0);
    const mW = Number(scores.modern_w || 0);

    const cS = Number(city.culture_score || 0);
    const nS = Number(city.nature_score || 0);
    const sS = Number(city.social_score || 0);
    const mS = Number(city.modern_score || 0);

    const rawMatch = (cW * cS) + (nW * nS) + (sW * sS) + (mW * mS);

    // Skor 0-100 arasına normalize ediliyor
    const score = (rawMatch / 20) * 100; 
    if (score >= 75) expl.push(`${city.city_name} şehri yaşam tarzı beklentilerinize çok uygun.`);
    return score;
  }

  private calculateAcademicScore(studentRank: number, baseRank: number, expl: string[]): number {
    const sRank = Number(studentRank);
    const bRank = Number(baseRank);

    if (!sRank || !bRank) return 50; // Veri yoksa nötr puan
    
    if (sRank <= bRank) {
      expl.push("Sıralamanız bu bölümün taban sıralamasından daha iyi.");
      return 100;
    }
    if (sRank <= bRank * 1.2) {
      expl.push("Sıralamanız bölüme yakın, yerleşme ihtimaliniz var.");
      return 60;
    }
    return 10;
  }

  private calculateFinancialScore(status: string, costIndex: any, expl: string[]): number {
    const cost = Number(costIndex || 0);
    
    // Nisa'nın 'Düşük', 'Orta', 'Yüksek' kategorileriyle eşleşme
    if (status === 'Yüksek') return 100;
    if (status === 'Orta' && cost <= 4) return 100;
    if (status === 'Düşük' && cost <= 2.5) {
      expl.push("Bütçenizi zorlamayacak ekonomik bir şehir.");
      return 100;
    }
    expl.push("Şehrin yaşam maliyeti bütçenizi biraz aşabilir.");
    return 40;
  }
}