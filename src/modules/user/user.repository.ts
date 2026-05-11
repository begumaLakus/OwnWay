import { prisma } from "../../config/prisma";

/**
 * 🔹 Kullanıcıyı ve ilişkili olduğu tüm tabloları tek seferde çeker.
 * Şema isimlendirmelerine (profile, test_scores vb.) göre düzeltildi.
 */
export const getUserWithProfile = async (userId: number) => {
  // @ts-ignore: Prisma client 'users' olarak üretiyor, runtime'da çalışıyor
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      test_scores: true,
      career_suggestions: true,
      // Şehir ismini alabilmek için iç içe (nested) include yapıyoruz:
      matched_cities: {
        include: {
          city: true // Bu sayede city_name verisine ulaşabileceksin
        }
      }
    },
  });
};

/**
 * 🔹 Kullanıcının profil bilgilerini güncellemek için.
 * Model adı 'User_Profile' ama prisma client'ta 'user_Profile' veya 'user_profile' olur.
 */
export const updateProfile = async (userId: number, profileData: any) => {
  // @ts-ignore: Model ismi büyük/küçük harf çakışmasını önlemek için
  return await prisma.user_Profile.update({
    where: { user_id: userId },
    data: {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      current_location: profileData.current_location,
      high_school: profileData.high_school,
      dept_type: profileData.dept_type, 
      financial_status: profileData.financial_status,
      personality_type: profileData.personality_type
    },
  });
};

/**
 * 🔹 Test sonuçlarını kaydetmek veya güncellemek için.
 */
export const saveTestScores = async (userId: number, scores: any) => {
  // Frontend'den gelen 0-100 puanları 0-1 ağırlığa dönüştürüyoruz.
  // Şehir skorları 0-5 ölçeğinde olduğu için recommendation hesaplaması
  // bu ağırlıkları * 5 yaparak ölçeklendiriyor.
  const normalizedScores = {
    culture_w: (scores.culture_w ?? 0) / 100,
    nature_w:  (scores.nature_w  ?? 0) / 100,
    social_w:  (scores.social_w  ?? 0) / 100,
    modern_w:  (scores.modern_w  ?? 0) / 100,
  };

  // @ts-ignore: Model ismi büyük/küçük harf çakışmasını önlemek için
  return await prisma.user_Test_Score.upsert({
    where: { user_id: userId },
    update: normalizedScores,
    create: {
      user_id: userId,
      ...normalizedScores,
    }
  });
};