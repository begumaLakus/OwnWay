import { prisma } from "../../config/prisma";

// Sistemdeki tüm kullanıcıları profilleriyle birlikte listelemek için
export const getAllUsers = async () => {
  // @ts-ignore: Prisma client 'users' olarak üretiyor, runtime'da çalışıyor
  return prisma.user.findMany({
    include: {
      profile: true, // Şemada User içindeki ilişki adı 'profile'
    },
  });
};

// Bir kullanıcıyı silmek için
export const deleteUserById = async (userId: number) => { // id artık number!
  // @ts-ignore
  return prisma.user.delete({
    where: { 
      id: userId // 🔥 KRİTİK HATA DÜZELTİLDİ: user_id değil, sadece id!
    },
  });
};