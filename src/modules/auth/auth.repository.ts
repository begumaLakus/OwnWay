import { prisma } from "../../config/prisma";

export const findUserByEmail = async (email: string) => {
  // @ts-ignore: Prisma client 'users' olarak üretiyor, runtime'da çalışıyor
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password_hash: true,
      role: true,
      profile: {          // ← bunu ekledik
        select: {
          first_name: true,
          last_name: true,
          current_location: true,
          high_school: true,
          dept_type: true,
          personality_type: true,
          financial_status: true,
        }
      }
    },
  });
};

export const createUser = async (email: string, password_hash: string) => {
  // @ts-ignore
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