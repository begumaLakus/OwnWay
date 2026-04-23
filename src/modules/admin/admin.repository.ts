import { prisma } from "../../config/prisma";

// Sistemdeki tüm kullanıcıları profilleriyle birlikte listelemek için
export const getAllUsers = async () => {
  return prisma.user.findMany({
    include: {
      profile: true, // Şemada User içindeki ilişki adı 'profile'
    },
  });
};

// Bir kullanıcıyı silmek için
export const deleteUserById = async (userId: number) => { // id artık number!
  return prisma.user.delete({
    where: { 
      id: userId // 🔥 KRİTİK HATA DÜZELTİLDİ: user_id değil, sadece id!
    },
  });
};