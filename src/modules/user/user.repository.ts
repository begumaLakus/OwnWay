import { prisma } from "../../config/prisma";

// 🔹 Kullanıcının profil bilgilerini güncellemek için
export const updateProfile = async (userId: number, profileData: any) => {
  // 🔥 DÜZELTME 1: userId artık number! (Şemada Int @id)
  return prisma.user_Profile.update({
    where: { user_id: userId },
    data: {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      current_location: profileData.current_location,
      high_school: profileData.high_school,
      dept_type: profileData.dept_type, 
      financial_status: profileData.financial_status,
      personality_type: profileData.personality_type // Şemada bu da vardı, ekledim.
    },
  });
};

// 🔹 Test sonuçlarını kaydetmek/güncellemek için
export const saveTestScores = async (userId: number, scores: any) => {
  // 🔥 DÜZELTME 2: 'upsert' içindeki 'user_id' benzersiz olmalı. 
  // Ayrıca scores içindeki gereksiz alanları ayıklıyoruz.
  return prisma.user_Test_Score.upsert({
    where: { user_id: userId },
    update: {
      culture_w: scores.culture_w,
      nature_w: scores.nature_w,
      social_w: scores.social_w,
      modern_w: scores.modern_w,
    },
    create: {
      user_id: userId,
      culture_w: scores.culture_w,
      nature_w: scores.nature_w,
      social_w: scores.social_w,
      modern_w: scores.modern_w,
    }
  });
};