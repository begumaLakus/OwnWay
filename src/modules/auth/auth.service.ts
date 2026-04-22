import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError";
import { findUserByEmail } from "./auth.repository";
import { prisma } from "../../config/prisma";

// 🔹 REGISTER
export const registerService = async (email: string, password: string) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashed = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Kullanıcı oluştur
    const user = await tx.user.create({
      data: {
        email,
        password_hash: hashed,
        role: "student", // varsayılan rol
      },
    });

    // 2. Profil oluştur — field adı schema'da `id`, `user_id` değil!
    await tx.user_Profile.create({
      data: {
        user_id: user.id, // ← user.user_id değil, user.id !
        first_name: "Yeni",
        last_name: "Kullanıcı",
      },
    });

    return user;
  });

  return {
    user_id: result.id, // ← tutarlı olması için id kullan
    email: result.email,
  };
};
// 🔹 LOGIN
export const loginService = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const match = await bcrypt.compare(password, user.password_hash ?? "");

  if (!match) {
    throw new AppError("Invalid credentials", 401);
  }

  return {
    user_id: user.id,
    email: user.email,
    role: user.role,
  };
};