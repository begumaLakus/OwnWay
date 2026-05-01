/**
 * Recommendation Logic - OwnWay Algoritması
 */

export interface Scores {
  culture_w: number;
  nature_w: number;
  social_w: number;
  modern_w: number;
}

/**
 * Kullanıcı skorları ile bir şehrin skorları arasındaki uyum yüzdesini hesaplar.
 * @param userScores Kullanıcının testten aldığı ağırlıklar
 * @param cityScores Şehrin veritabanındaki metrikleri
 */
export const calculateMatchRate = (userScores: Scores, cityScores: Scores): number => {
  // 1. Her kategorideki farkın karesini alıyoruz (Öklid mantığı başlangıcı)
  // Farkın karesini almak, büyük farkları daha fazla "cezalandırır".
  const diffs = [
    Math.pow(Number(userScores.culture_w) - Number(cityScores.culture_w), 2),
    Math.pow(Number(userScores.nature_w) - Number(cityScores.nature_w), 2),
    Math.pow(Number(userScores.social_w) - Number(cityScores.social_w), 2),
    Math.pow(Number(userScores.modern_w) - Number(cityScores.modern_w), 2)
  ];

  // 2. Farkların toplamının karekökünü alıyoruz (Vektörel mesafe)
  const distance = Math.sqrt(diffs.reduce((acc, val) => acc + val, 0));

  // 3. Maksimum olası mesafe (4 kategori için 0-100 arası) yaklaşık 200'dür.
  // Bu mesafeyi 0-100 arası bir "Uyum Yüzdesi"ne çeviriyoruz.
  const maxDistance = 200; 
  const matchPercentage = Math.max(0, 100 - (distance / maxDistance) * 100);

  return Math.round(matchPercentage);
};

/**
 * Kullanıcının en baskın karakter özelliğini bulur (Mülakat için ekstra özellik)
 */
export const getDominantTrait = (scores: Scores) => {
  const entries = Object.entries(scores);
  const dominant = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
  
  const traitMap: Record<string, string> = {
    culture_w: "Kültür Meraklısı",
    nature_w: "Doğa Tutkunu",
    social_w: "Sosyal Kelebek",
    modern_w: "Modernist"
  };

  return traitMap[dominant[0]];
};