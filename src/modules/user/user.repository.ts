import { prisma } from "../../config/prisma";

// Kullanıcının profil bilgilerini güncellemek için
export const updateProfile = async (userId: string, profileData: any) => {
  return prisma.user_Profile.update({
    where: { user_id: userId },
    data: {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      current_location: profileData.current_location,
      high_school: profileData.high_school,
      dept_type: profileData.dept_type, 
      financial_status: profileData.financial_status,
    },
  });
};

// HATA BURADAYDI: user_Test_Scores yerine user_Test_Score yaptık
export const saveTestScores = async (userId: string, scores: any) => {
  return prisma.user_Test_Score.upsert({ // 's' harfini sildik
    where: { user_id: userId },
    update: scores,
    create: {
      user_id: userId,
      ...scores
    }
  });
};