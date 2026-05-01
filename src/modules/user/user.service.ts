import * as repo from "./user.repository";
import { AppError } from "../../utils/AppError";

/**
 * 🔹 KULLANICI PROFİLİNİ GETİRME SERVİSİ
 * Şeyma'nın profil sayfasındaki boşlukları dolduracak olan asıl veri buradan gider.
 */
export const getUserProfileService = async (userId: any) => {
  const numericUserId = Number(userId);

  if (isNaN(numericUserId)) {
    throw new AppError("Geçersiz kullanıcı kimliği.", 400);
  }

  // Repository katmanından kullanıcıyı profiliyle birlikte çekiyoruz
  const user = await repo.getUserWithProfile(numericUserId);

  if (!user) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  return user;
};

/**
 * 🔹 PROFİL GÜNCELLEME SERVİSİ
 * Kullanıcı bilgilerini güncellediğinde çalışır.
 */
export const updateProfileService = async (userId: any, profileData: any) => {
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

/**
 * 🔹 TEST PUANLARINI KAYDETME SERVİSİ
 * Şehir önerisi testinden gelen verileri Nisa'nın DB şemasına göre formatlar.
 */
export const saveTestScoreService = async (userId: any, scores: any) => {
  const numericUserId = Number(userId);

  if (isNaN(numericUserId)) {
    throw new AppError("Geçersiz kullanıcı kimliği.", 400);
  }

  // Şeyma'nın frontend'den gönderdiği (culture, nature vb.) isimleri, 
  // Nisa'nın veritabanındaki (culture_w vb.) kolon isimleriyle eşleştiriyoruz.
  const formattedScores = {
    culture_w: scores.culture ?? 0.5,
    nature_w: scores.nature ?? 0.5,
    social_w: scores.social ?? 0.5,
    modern_w: scores.modern ?? 0.5,
  };

  return await repo.saveTestScores(numericUserId, formattedScores);
};