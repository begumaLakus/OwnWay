/**
 * @file RecommendationLogic.ts
 * @description Cosine Similarity tabanlı şehir öneri motoru.
 *
 * Değişiklikler (v2):
 * - calculateLifestyleScore: dot-product → cosine similarity
 *   Artık "en yüksek toplam skorlu şehir" değil, "kullanıcının tercihlerine
 *   yön olarak en yakın şehir" kazanıyor. Örn: doğa seven kullanıcı için
 *   doğa skoru yüksek şehir öne çıkar (İstanbul değil Zonguldak/Antalya).
 * - calculateAcademicScore: exam_rank User_Profile'da olmadığı için kaldırıldı.
 *   Ağırlık lifestyle ve financial'a aktarıldı.
 * - calculateFinancialScore: koşullar daraltıldı, artık ayırt edici.
 * - WEIGHTS: lifestyle %70, financial %30 (academic kaldırıldı).
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
    lifestyle: 0.70,
    financial: 0.30,
  };

  public calculate(
    userProfile: any,
    userScores: any,
    departments: any[]
  ): IRecommendationResult[] {
    if (!userProfile || !userScores || !departments) return [];

    return departments.map((dept) => {
      const explanations: string[] = [];

      // 1. ŞEHİR YAŞAM TARZI UYUMU — Cosine Similarity
      const lifestyleScore = this.calculateLifestyleScore(
        userScores,
        dept.university.city,
        explanations
      );

      // 2. EKONOMİK UYUM
      const financialScore = this.calculateFinancialScore(
        userProfile.financial_status,
        dept.university.city.total_cost_index,
        explanations
      );

      const totalScore =
        lifestyleScore * this.WEIGHTS.lifestyle +
        financialScore * this.WEIGHTS.financial;

      return {
        dept_id: dept.id,
        uni_name: dept.university.uni_name,
        dept_name: dept.dept_name,
        city_name: dept.university.city.city_name,
        match_score: Math.round(totalScore),
        explanations: [...new Set(explanations)],
      };
    });
  }

  // --- PRIVATE HELPER METHODS ---

  /**
   * Cosine Similarity kullanarak kullanıcı tercihi ile şehir profilinin
   * yön benzerliğini ölçer (0-100).
   *
   * Eski yöntem (dot-product): Tüm boyutlarda yüksek skora sahip şehir kazanırdı.
   * Yeni yöntem (cosine): Kullanıcının hangi boyutu önemsediğiyle eşleşen şehir kazanır.
   */
  private calculateLifestyleScore(
    scores: any,
    city: any,
    expl: string[]
  ): number {
    // Kullanıcı ağırlık vektörü (0–1)
    const cW = Number(scores.culture_w || 0);
    const nW = Number(scores.nature_w || 0);
    const sW = Number(scores.social_w || 0);
    const mW = Number(scores.modern_w || 0);

    // Şehir profil vektörü (0–5 → 0–1 normalize)
    const cS = Number(city.culture_score || 0) / 5;
    const nS = Number(city.nature_score || 0) / 5;
    const sS = Number(city.social_score || 0) / 5;
    const mS = Number(city.modern_score || 0) / 5;

    // Cosine = (u · c) / (|u| × |c|)
    const dot = cW * cS + nW * nS + sW * sS + mW * mS;
    const userMag = Math.sqrt(cW * cW + nW * nW + sW * sW + mW * mW);
    const cityMag = Math.sqrt(cS * cS + nS * nS + sS * sS + mS * mS);

    if (userMag === 0 || cityMag === 0) return 50; // Veri yoksa nötr

    const similarity = dot / (userMag * cityMag); // 0–1 arası
    const score = similarity * 100;

    if (score >= 85) expl.push(`${city.city_name} senin için mükemmel bir eşleşme!`);
    else if (score >= 70) expl.push(`${city.city_name} şehri yaşam tarzı beklentilerinize çok uygun.`);

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Finansal durum ile şehrin yaşam maliyeti endeksini karşılaştırır.
   * Daha dar aralıklar → daha ayırt edici sonuçlar.
   */
  private calculateFinancialScore(
    status: string,
    costIndex: any,
    expl: string[]
  ): number {
    const cost = Number(costIndex || 0);

    if (status === 'Yüksek') return 100; // Bütçe kısıtı yok

    if (status === 'Orta') {
      if (cost <= 3.0) return 100;
      if (cost <= 4.0) {
        expl.push("Şehrin yaşam maliyeti bütçenizin üst sınırına yakın.");
        return 60;
      }
      expl.push("Şehrin yaşam maliyeti bütçenizi aşabilir.");
      return 20;
    }

    // Düşük bütçe
    if (cost <= 2.5) {
      expl.push("Bütçenizi zorlamayacak ekonomik bir şehir.");
      return 100;
    }
    if (cost <= 3.5) {
      expl.push("Şehrin yaşam maliyeti bütçenizi biraz zorlayabilir.");
      return 45;
    }
    expl.push("Şehrin yaşam maliyeti bütçenizi aşıyor.");
    return 10;
  }
}
