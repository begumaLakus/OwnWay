import * as repo from "./user.repository";
import { AppError } from "../../utils/AppError";

// 🔹 PROFİL GÜNCELLEME SERVİSİ
export const updateProfileService = async (userId: string, profileData: any) => {
  // Burada istersen veri kontrolü yapabilirsin (Örn: Ad boş mu?)
  if (!profileData.first_name || !profileData.last_name) {
    throw new AppError("Ad ve soyad alanları boş bırakılamaz.", 400);
  }

  return await repo.updateProfile(userId, profileData);
};

// 🔹 TEST PUANLARINI KAYDETME SERVİSİ
export const saveTestScoreService = async (userId: string, scores: any) => {
  // Nisa'nın beklediği 0-1 arası ağırlık puanlarını burada kontrol edebiliriz
  // Şeyma'dan gelen ham puanları Begüm'ün istediği formatta düzenleyebiliriz
  
  const formattedScores = {
    culture_w: scores.culture || 0.5,
    nature_w: scores.nature || 0.5,
    social_w: scores.social || 0.5,
    modern_w: scores.modern || 0.5,
  };

  return await repo.saveTestScores(userId, formattedScores);
};