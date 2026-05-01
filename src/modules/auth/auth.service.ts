import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError";
import { findUserByEmail } from "./auth.repository";
import { prisma } from "../../config/prisma";

// 🔹 REGISTER
export const registerService = async (userData: any) => {
  const { email, password, first_name, last_name, ...profileData } = userData;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AppError("Bu e-posta adresi zaten kullanımda.", 400);
  }

  const hashed = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password_hash: hashed,
        role: "student",
      },
    });

    await tx.user_Profile.create({
      data: {
        user_id: user.id,
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

  // ← first_name ve last_name artık döndürülüyor
  return {
    id: result.id,
    email: result.email,
    first_name: first_name || "Yeni",
    last_name: last_name || "Kullanıcı",
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

  // ← profile bilgileri artık döndürülüyor
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.profile?.first_name ?? "",
    last_name: user.profile?.last_name ?? "",
    current_location: user.profile?.current_location ?? "",
    high_school: user.profile?.high_school ?? "",
    dept_type: user.profile?.dept_type ?? "",
    personality_type: user.profile?.personality_type ?? "",
  };
};