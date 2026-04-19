import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError";
import { findUserByEmail, createUser } from "./auth.repository";
import { prisma } from "../../config/prisma"; // Profile eklemek için prisma'yı buraya da import ettik

// 🔹 REGISTER
export const registerService = async (email: string, password: string) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashed = await bcrypt.hash(password, 10);

  // 1. Kullanıcıyı oluştur
  const user = await createUser(email, hashed);

  // 2. Kullanıcıya boş bir profil oluştur (Nisa'nın yeni tablosu)
  // Şimdilik isim soyisim gibi alanları boş bırakıyoruz, kullanıcı sonra güncelleyecek.
  await prisma.user_Profile.create({
    data: {
      user_id: user.user_id,
      first_name: "Yeni", // Varsayılan isim
      last_name: "Kullanıcı", // Varsayılan soyisim
    },
  });

  return {
    user_id: user.user_id,
    email: user.email,
  };
};

// 🔹 LOGIN
export const loginService = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) {
    throw new AppError("Invalid credentials", 401);
  }

  return user;
};