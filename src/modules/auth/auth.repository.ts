import { prisma } from "../../config/prisma";

// 🔹 USER BUL
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

// 🔹 USER OLUŞTUR
export const createUser = async (email: string, password: string) => {
  return prisma.user.create({
    data: {
      email,
      password_hash: password,
      // !!!! çok önemliiii 'role' alanını sildik, çünkü Prisma şemadaki default değeri kullanacak.
    },
  });
};