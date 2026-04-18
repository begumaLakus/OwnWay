import { prisma } from "../../config/prisma";

// Sistemdeki tüm kullanıcıları profilleriyle birlikte listelemek için
export const getAllUsers = async () => {
  return prisma.user.findMany({
    include: {
      profile: true, // Nisa'nın yeni şemasında ilişki ismi 'profile' oldu
    },
  });
};

// Bir kullanıcıyı silmek için (Cascade silme aktifse profili de silinir)
export const deleteUserById = async (userId: string) => {
  return prisma.user.delete({
    where: { 
      user_id: userId 
    },
  });
};