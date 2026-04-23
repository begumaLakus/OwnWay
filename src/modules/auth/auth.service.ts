import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError";
import { findUserByEmail } from "./auth.repository";
import { prisma } from "../../config/prisma";

// 🔹 REGISTER
// 'any' yerine daha önce yazdığımız RegisterInput tipini de kullanabilirsin
export const registerService = async (userData: any) => {
  const { email, password, first_name, last_name, ...profileData } = userData;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("Bu e-posta adresi zaten kullanımda.", 400);
  }

  const hashed = await bcrypt.hash(password, 10);

  // Transaction kullanman harika, veri bütünlüğünü korur.
  const result = await prisma.$transaction(async (tx) => {
    // 1. Kullanıcıyı oluştur
    const user = await tx.user.create({
      data: {
        email,
        password_hash: hashed,
        role: "student",
      },
    });

    // 2. Profili oluştur (Şeyma'dan gelen tüm bilgiler buraya akıyor)
    await tx.user_Profile.create({
      data: {
        user_id: user.id, // Şemadaki id alanına user'dan gelen id'yi veriyoruz
        first_name: first_name || "Yeni",
        last_name: last_name || "Kullanıcı",
        current_location: profileData.current_location,
        high_school: profileData.high_school,
        dept_type: profileData.dept_type,
        financial_status: profileData.financial_status,
        personality_type: profileData.personality_type,
      },
    });

    return user;
  });

  return {
    id: result.id, // user_id değil, artık her yerde sadece id!
    email: result.email,
  };
};

// 🔹 LOGIN
export const loginService = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  const match = await bcrypt.compare(password, user.password_hash ?? "");

  if (!match) {
    throw new AppError("Hatalı şifre.", 401);
  }

  return {
    id: user.id, // user_id ismini id olarak düzelttim
    email: user.email,
    role: user.role,
  };
};