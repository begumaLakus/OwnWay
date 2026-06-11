import { prisma } from "../../config/prisma";
import { SubmitCareerTestInput } from "./career.schema";

// 🔹 İş Veritabanı
const jobDatabase: Record<string, string[]> = {
  "enterprising_conventional": ["Proje Yöneticisi", "Teknik Ürün Yöneticisi", "İş Analisti"],
  "enterprising_artistic": ["Dijital Pazarlama Direktörü", "Kreatif Direktör", "Girişimci / Kurucu Ortak"],
  "conventional_artistic": ["UX/UI Araştırmacısı", "Teknik Dokümantasyon Uzmanı", "Sistem Tasarımcısı"],
  "investigative_realistic": ["Yazılım Mühendisi", "Veri Bilimci", "Siber Güvenlik Uzmanı"],
  "artistic_social": ["UX/UI Tasarımcısı", "Rehber Danışman", "Dijital İçerik Üreticisi"],
  "realistic_conventional": ["Veritabanı Yöneticisi (DBA)", "Network Uzmanı", "Sistem Yöneticisi"],
  "investigative_artistic": ["Yapay Zeka Uzmanı", "Oyun Tasarımcısı", "Ar-Ge Mühendisi"],
  "realistic_investigative": ["Robotik Sistemler Uzmanı", "Veri Analisti", "Sistem Analisti"]
};

// 🔹 Kariyer Testi İşleme Servisi
export const processCareerTest = async (userId: number, input: SubmitCareerTestInput) => {
  return await prisma.$transaction(async (tx) => {
    
    // 1. Puanları sırala
    const scoresArray = [
      { type: "realistic", score: input.realistic },
      { type: "investigative", score: input.investigative },
      { type: "artistic", score: input.artistic },
      { type: "social", score: input.social },
      { type: "enterprising", score: input.enterprising },
      { type: "conventional", score: input.conventional },
    ];

    scoresArray.sort((a, b) => b.score - a.score);

    const first = scoresArray[0];
    const second = scoresArray[1];
    const third = scoresArray[2];

    // 2. Anahtar oluşturma ve iş eşleştirme
    const primaryKey = `${first.type}_${second.type}`;
    const primaryKeyAlt = `${second.type}_${first.type}`;
    const coreJobs = jobDatabase[primaryKey] || jobDatabase[primaryKeyAlt] || ["Genel Sektör Danışmanı"];

    // 3. Alternatif işler (Puan toleransı - Delta)
    let alternativeJobs: string[] = [];
    const THRESHOLD = 2; 

    if (second.score - third.score <= THRESHOLD) {
      const altKey = `${first.type}_${third.type}`;
      const altKeyAlt = `${third.type}_${first.type}`;
      const rawAlts = jobDatabase[altKey] || jobDatabase[altKeyAlt] || [];
      alternativeJobs = rawAlts.filter(job => !coreJobs.includes(job));
    } else {
      alternativeJobs = [`Sektörel ${second.type.toUpperCase()} Danışmanı`];
    }

    // 4. Veritabanı Güncellemeleri
    const personalityType = first.type.toUpperCase();
    const profileUpdate = await tx.user_Profile.updateMany({
      where: { user_id: userId },
      data: { personality_type: personalityType },
    });

    if (profileUpdate.count === 0) {
      await tx.user_Profile.create({
        data: {
          user_id: userId,
          first_name: "Kullanıcı",
          last_name: "Kullanıcı",
          personality_type: personalityType,
        },
      });
    }

    await tx.user_Career_Suggestion.deleteMany({
      where: { user_id: userId }
    });

    const allSuggestedJobs = [...coreJobs, ...alternativeJobs].slice(0, 6);

    await tx.user_Career_Suggestion.createMany({
      data: allSuggestedJobs.map((job) => ({
        user_id: userId,
        occupation_name: job
      }))
    });

    return {
      personality_type: first.type.toUpperCase(),
      core: coreJobs,
      alternatives: alternativeJobs
    };
  });
};

// 🔹 TEST MODÜLÜ (Doğrulama için)
export const runCareerTestSimulation = async () => {
  console.log("🚀 Kariyer Testi Mantık Simülasyonu Çalışıyor...");
  const mockInput = {
    realistic: 10, investigative: 9, artistic: 2, 
    social: 3, enterprising: 5, conventional: 1
  };
  
  const scores = Object.entries(mockInput).map(([type, score]) => ({ type, score }));
  scores.sort((a, b) => b.score - a.score);
  
  console.log("-> Sıralanan Puanlar:", scores.slice(0, 3));
  console.log("-> Tespit Edilen Anahtar:", `${scores[0].type}_${scores[1].type}`);
};