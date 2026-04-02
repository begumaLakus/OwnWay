import { email } from "zod";
import { prisma } from "../../config/prisma";


const useDB = false;

// geçici memory
const users: any[] = [];

export const findUserByEmail = async (email: string) => {
  if (useDB) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  // mock
  return users.find((u) => u.email === email);
};

export const createUser = async (email: string, password: string) => {
  if (useDB) {
    return prisma.user.create({
      data: { email, password },
    });
  }

  //mock 
  const user={
    id:Date.now(),
    email,
    password,
};

 users.push(user);
  return user;
};