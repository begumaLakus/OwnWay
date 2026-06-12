import { prisma } from "../../config/prisma";
import { SubmitCareerTestInput } from "./career.schema";

// ============================================================
// MESLEK PROFİL VERİTABANI
// Her mesleğin 6 RIASEC boyutundaki ideal skoru (0-10)
// Gerçek O*NET ve Holland araştırmalarına dayalı
// ============================================================
const occupationProfiles: Record<string, Record<string, number>> = {
  // 🖥️ TEKNOLOJİ & MÜHENDİSLİK
  "Yazılım Mühendisi":           { realistic: 7, investigative: 10, artistic: 5, social: 3, enterprising: 5, conventional: 7 },
  "Veri Bilimci":                { realistic: 6, investigative: 10, artistic: 3, social: 3, enterprising: 5, conventional: 9 },
  "Siber Güvenlik Uzmanı":       { realistic: 8, investigative: 10, artistic: 3, social: 3, enterprising: 5, conventional: 7 },
  "Yapay Zeka Mühendisi":        { realistic: 6, investigative: 10, artistic: 6, social: 3, enterprising: 6, conventional: 7 },
  "Sistem Yöneticisi":           { realistic: 9, investigative: 8,  artistic: 2, social: 3, enterprising: 4, conventional: 9 },
  "Veritabanı Yöneticisi":       { realistic: 7, investigative: 8,  artistic: 2, social: 3, enterprising: 4, conventional: 10},
  "Robotik Sistemler Uzmanı":    { realistic: 10,investigative: 9,  artistic: 5, social: 3, enterprising: 5, conventional: 6 },
  "Network Uzmanı":              { realistic: 8, investigative: 8,  artistic: 2, social: 3, enterprising: 4, conventional: 8 },
  "Ar-Ge Mühendisi":             { realistic: 7, investigative: 10, artistic: 7, social: 3, enterprising: 6, conventional: 5 },
  "Biyomedikal Mühendisi":       { realistic: 8, investigative: 10, artistic: 4, social: 7, enterprising: 5, conventional: 6 },

  // 🎨 TASARIM & YARATICI
  "UX/UI Tasarımcısı":           { realistic: 4, investigative: 7,  artistic: 10, social: 8, enterprising: 5, conventional: 5 },
  "Grafik Tasarımcı":            { realistic: 4, investigative: 4,  artistic: 10, social: 5, enterprising: 5, conventional: 6 },
  "Oyun Tasarımcısı":            { realistic: 6, investigative: 7,  artistic: 10, social: 4, enterprising: 6, conventional: 4 },
  "Oyun Geliştirici":            { realistic: 7, investigative: 9,  artistic: 8,  social: 3, enterprising: 5, conventional: 6 },
  "3D Modelleme Uzmanı":         { realistic: 6, investigative: 5,  artistic: 10, social: 3, enterprising: 4, conventional: 5 },
  "Animasyon Uzmanı":            { realistic: 5, investigative: 5,  artistic: 10, social: 4, enterprising: 4, conventional: 5 },
  "Dijital İçerik Üreticisi":    { realistic: 3, investigative: 4,  artistic: 9,  social: 8, enterprising: 7, conventional: 4 },
  "Kreatif Direktör":            { realistic: 3, investigative: 5,  artistic: 10, social: 6, enterprising: 9, conventional: 4 },

  // 📊 İŞ & YÖNETİM
  "Proje Yöneticisi":            { realistic: 5, investigative: 7,  artistic: 4, social: 7, enterprising: 10, conventional: 8 },
  "İş Analisti":                 { realistic: 4, investigative: 9,  artistic: 4, social: 6, enterprising: 8,  conventional: 9 },
  "Girişimci / Kurucu":          { realistic: 5, investigative: 7,  artistic: 7, social: 7, enterprising: 10, conventional: 4 },
  "Ürün Müdürü":                 { realistic: 5, investigative: 8,  artistic: 6, social: 7, enterprising: 10, conventional: 6 },
  "Operasyon Müdürü":            { realistic: 6, investigative: 6,  artistic: 3, social: 6, enterprising: 9,  conventional: 9 },
  "Dijital Pazarlama Uzmanı":    { realistic: 3, investigative: 6,  artistic: 8, social: 7, enterprising: 9,  conventional: 5 },
  "Teknik Ürün Yöneticisi":      { realistic: 6, investigative: 9,  artistic: 5, social: 6, enterprising: 9,  conventional: 7 },

  // 💰 FİNANS & ANALİZ
  "Finansal Analist":            { realistic: 4, investigative: 9,  artistic: 2, social: 4, enterprising: 7,  conventional: 10},
  "Aktüer":                      { realistic: 4, investigative: 10, artistic: 2, social: 4, enterprising: 6,  conventional: 10},
  "Veri Analisti":               { realistic: 5, investigative: 10, artistic: 3, social: 4, enterprising: 6,  conventional: 9 },
  "Danışmanlık Uzmanı":          { realistic: 4, investigative: 8,  artistic: 4, social: 7, enterprising: 9,  conventional: 7 },

  // 🧠 SOSYAL & EĞİTİM
  "Klinik Psikolog":             { realistic: 2, investigative: 9,  artistic: 5, social: 10, enterprising: 4, conventional: 5 },
  "Akademisyen":                 { realistic: 4, investigative: 10, artistic: 6, social: 8,  enterprising: 4, conventional: 6 },
  "Rehber Danışman":             { realistic: 2, investigative: 6,  artistic: 6, social: 10, enterprising: 5, conventional: 5 },
  "İnsan Kaynakları Müdürü":     { realistic: 3, investigative: 6,  artistic: 4, social: 10, enterprising: 8, conventional: 7 },
  "Eğitim Koordinatörü":         { realistic: 3, investigative: 6,  artistic: 6, social: 10, enterprising: 7, conventional: 7 },
  "Halkla İlişkiler Uzmanı":     { realistic: 2, investigative: 5,  artistic: 7, social: 9,  enterprising: 8, conventional: 5 },
  "Sosyal Hizmet Uzmanı":        { realistic: 3, investigative: 6,  artistic: 4, social: 10, enterprising: 4, conventional: 6 },

  // 🏥 SAĞLIK
  "Fizyoterapist":               { realistic: 8, investigative: 7,  artistic: 4, social: 9,  enterprising: 4, conventional: 5 },
  "Hasta Koordinatörü":          { realistic: 4, investigative: 5,  artistic: 3, social: 10, enterprising: 5, conventional: 8 },

  // 🏗️ MÜHENDİSLİK & ENDÜSTRİ
  "İnşaat Proje Yöneticisi":     { realistic: 10,investigative: 6,  artistic: 3, social: 5,  enterprising: 9, conventional: 7 },
  "Üretim Müdürü":               { realistic: 9, investigative: 6,  artistic: 3, social: 5,  enterprising: 9, conventional: 8 },
  "Tedarik Zinciri Uzmanı":      { realistic: 7, investigative: 7,  artistic: 2, social: 5,  enterprising: 8, conventional: 9 },
  "İş Güvenliği Uzmanı":         { realistic: 8, investigative: 7,  artistic: 2, social: 7,  enterprising: 5, conventional: 8 },
  "Spor Koçu":                   { realistic: 8, investigative: 5,  artistic: 4, social: 9,  enterprising: 7, conventional: 4 },

  // 📝 DİĞER
  "Teknik Dokümantasyon Uzmanı": { realistic: 5, investigative: 7,  artistic: 6, social: 4,  enterprising: 4, conventional: 9 },
  "Web Tasarımcısı":             { realistic: 5, investigative: 6,  artistic: 9, social: 4,  enterprising: 5, conventional: 6 },
  "Eğitim Yöneticisi":           { realistic: 3, investigative: 6,  artistic: 4, social: 9,  enterprising: 8, conventional: 8 },
};

// ============================================================
// MATEMATİKSEL HESAPLAMA MOTORu
// ============================================================

const CATEGORIES = ["realistic", "investigative", "artistic", "social", "enterprising", "conventional"] as const;
type Category = typeof CATEGORIES[number];

/**
 * Cosine Similarity: İki vektör arasındaki açısal benzerlik
 * Sonuç: 0 (hiç benzer değil) → 1 (mükemmel eşleşme)
 */
const cosineSimilarity = (
  userVec: Record<string, number>,
  occVec: Record<string, number>
): number => {
  let dot = 0, uMag = 0, oMag = 0;
  for (const cat of CATEGORIES) {
    const u = userVec[cat] ?? 0;
    const o = occVec[cat] ?? 0;
    dot  += u * o;
    uMag += u * u;
    oMag += o * o;
  }
  if (uMag === 0 || oMag === 0) return 0;
  return dot / (Math.sqrt(uMag) * Math.sqrt(oMag));
};

/**
 * Euclidean Distance Penalty: Mutlak puan farkı cezası
 * Cosine yönü doğru ama magnitudes çok farklıysa penalize et
 * Sonuç: 0 (çok uzak) → 1 (çok yakın)
 */
const euclideanProximity = (
  userVec: Record<string, number>,
  occVec: Record<string, number>
): number => {
  let sumSq = 0;
  for (const cat of CATEGORIES) {
    const diff = (userVec[cat] ?? 0) - (occVec[cat] ?? 0);
    sumSq += diff * diff;
  }
  const distance = Math.sqrt(sumSq);
  // Max olası mesafe: sqrt(6 * 10^2) ≈ 24.49
  return 1 - (distance / 24.49);
};

/**
 * Holland Peak Bonus: Kullanıcının en yüksek 3 kategorisi
 * meslekle örtüşüyorsa ekstra puan
 */
const hollandPeakBonus = (
  userVec: Record<string, number>,
  occVec: Record<string, number>
): number => {
  const userTop3 = CATEGORIES
    .slice()
    .sort((a, b) => (userVec[b] ?? 0) - (userVec[a] ?? 0))
    .slice(0, 3);

  const occTop3 = CATEGORIES
    .slice()
    .sort((a, b) => (occVec[b] ?? 0) - (occVec[a] ?? 0))
    .slice(0, 3);

  const overlap = userTop3.filter(cat => occTop3.includes(cat)).length;
  // 3 örtüşme = +0.15, 2 = +0.10, 1 = +0.05, 0 = 0
  return overlap * 0.05;
};

/**
 * COMPOSITE SCORE
 * Cosine (yön benzerliği)     → %55 ağırlık
 * Euclidean (mesafe yakınlığı) → %30 ağırlık
 * Holland Peak Bonus           → %15 ağırlık
 */
const calculateCompositeScore = (
  userVec: Record<string, number>,
  occVec: Record<string, number>
): number => {
  const cosine    = cosineSimilarity(userVec, occVec);
  const euclidean = euclideanProximity(userVec, occVec);
  const bonus     = hollandPeakBonus(userVec, occVec);
  return (cosine * 0.55) + (euclidean * 0.30) + bonus;
};

// ============================================================
// KULLANICI PROFİL ANALİZİ
// ============================================================

const analyzeUserProfile = (input: SubmitCareerTestInput) => {
  const userVec: Record<string, number> = {
    realistic:     input.realistic,
    investigative: input.investigative,
    artistic:      input.artistic,
    social:        input.social,
    enterprising:  input.enterprising,
    conventional:  input.conventional,
  };

  // Tüm meslekler için composite skor hesapla
  const ranked = Object.entries(occupationProfiles)
    .map(([name, profile]) => ({
      name,
      score:     calculateCompositeScore(userVec, profile),
      cosine:    cosineSimilarity(userVec, profile),
      euclidean: euclideanProximity(userVec, profile),
    }))
    .sort((a, b) => b.score - a.score);

  // Holland kodu (en yüksek 3 kategori)
  const hollandCode = CATEGORIES
    .slice()
    .sort((a, b) => (userVec[b] ?? 0) - (userVec[a] ?? 0))
    .slice(0, 3)
    .map(c => c[0].toUpperCase()) // R, I, A, S, E, C
    .join("");

  // Dominant kategori
  const dominantCategory = CATEGORIES
    .slice()
    .sort((a, b) => (userVec[b] ?? 0) - (userVec[a] ?? 0))[0];

  return { ranked, hollandCode, dominantCategory, userVec };
};

// ============================================================
// ANA SERVİS
// ============================================================

export const processCareerTest = async (userId: number, input: SubmitCareerTestInput) => {
  return await prisma.$transaction(async (tx) => {

    const { ranked, hollandCode, dominantCategory } = analyzeUserProfile(input);

    // En iyi 3 → core, sonraki 3 → alternatives
    const top6        = ranked.slice(0, 6);
    const coreJobs    = top6.slice(0, 3).map(r => r.name);
    const altJobs     = top6.slice(3, 6).map(r => r.name);

    // Match score yüzde olarak (frontend için)
    const matchScores = top6.map(r => ({
      occupation:  r.name,
      matchPercent: Math.round(r.score * 100),
    }));

    const personalityType = dominantCategory.toUpperCase();

    // Profil güncelle
    const profileUpdate = await tx.user_Profile.updateMany({
      where: { user_id: userId },
      data:  { personality_type: personalityType },
    });

    if (profileUpdate.count === 0) {
      await tx.user_Profile.create({
        data: {
          user_id:          userId,
          first_name:       "Kullanıcı",
          last_name:        "Kullanıcı",
          personality_type: personalityType,
        },
      });
    }

    // Eski önerileri temizle
    await tx.user_Career_Suggestion.deleteMany({
      where: { user_id: userId },
    });

    // Yeni önerileri kaydet
    await tx.user_Career_Suggestion.createMany({
      data: [...coreJobs, ...altJobs].map(job => ({
        user_id:         userId,
        occupation_name: job,
      })),
    });

    return {
      personality_type: personalityType,
      holland_code:     hollandCode,       // Örn: "IRA", "ESC"
      core:             coreJobs,          // Top 3
      alternatives:     altJobs,           // 4-6 arası
      match_scores:     matchScores,       // Yüzde eşleşme skorları
    };
  });
};

// ============================================================
// TEST SİMÜLASYONU (Geliştirici aracı)
// ============================================================

export const runCareerTestSimulation = () => {
  console.log("🚀 Kariyer Testi Simülasyonu\n");

  const mockInput = {
    realistic: 3, investigative: 9, artistic: 7,
    social: 4, enterprising: 6, conventional: 5,
  };

  const { ranked, hollandCode, dominantCategory } = analyzeUserProfile(mockInput);

  console.log(`Holland Kodu : ${hollandCode}`);
  console.log(`Dominant Tip : ${dominantCategory.toUpperCase()}`);
  console.log("\nTop 6 Meslek Eşleşmesi:");
  ranked.slice(0, 6).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name.padEnd(30)} → %${Math.round(r.score * 100)} eşleşme`);
  });
};