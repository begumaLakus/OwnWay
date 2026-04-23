import * as repo from "./user.repository";
import { AppError } from "../../utils/AppError";

// 🔹 PROFİL GÜNCELLEME SERVİSİ
export const updateProfileService = async (userId: any, profileData: any) => {
  // 🔥 DÜZELTME 1: ID'yi garantiye almak için sayıya çeviriyoruz
  const numericUserId = Number(userId);

  if (isNaN(numericUserId)) {
    throw new AppError("Geçersiz kullanıcı kimliği.", 400);
  }

  // İş mantığı kontrolü
  if (!profileData.first_name || !profileData.last_name) {
    throw new AppError("Ad ve soyad alanları boş bırakılamaz.", 400);
  }

  return await repo.updateProfile(numericUserId, profileData);
};

// 🔹 TEST PUANLARINI KAYDETME SERVİSİ
export const saveTestScoreService = async (userId: any, scores: any) => {
  const numericUserId = Number(userId);

  if (isNaN(numericUserId)) {
    throw new AppError("Geçersiz kullanıcı kimliği.", 400);
  }

  // 🔹 Şeyma'nın frontend'den gönderdiği isimleri, 
  // Nisa'nın veritabanındaki (culture_w vb.) isimlerle eşleştiriyoruz.
  const formattedScores = {
    culture_w: scores.culture ?? 0.5,
    nature_w: scores.nature ?? 0.5,
    social_w: scores.social ?? 0.5,
    modern_w: scores.modern ?? 0.5,
  };

  return await repo.saveTestScores(numericUserId, formattedScores);
};