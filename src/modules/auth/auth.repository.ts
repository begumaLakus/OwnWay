import { prisma } from "../../config/prisma";

// 🔹 Email ile kullanıcı bul
export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password_hash: true,
      role: true,
    },
  });
};

// 🔹 Yeni kullanıcı oluştur
export const createUser = async (email: string, password_hash: string) => {
  return await prisma.user.create({
    data: {
      email,
      password_hash,
      role: "student",
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });
};