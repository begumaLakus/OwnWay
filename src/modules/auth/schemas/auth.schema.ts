import { z } from "zod";

// 🔹 REGISTER SCHEMA
// Frontend'den (Şeyma'dan) gelen tüm kayıt verilerini burada doğrulamalıyız.
export const registerSchema = z.object({
  email: z.string().email("Geçersiz e-posta formatı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  // Profil bilgileri için eklemeler:
  first_name: z.string().min(2, "İsim çok kısa").optional(),
  last_name: z.string().min(2, "Soyisim çok kısa").optional(),
  current_location: z.string().optional(),
  high_school: z.string().optional(),
  dept_type: z.string().optional(),
  financial_status: z.enum(["Düşük", "Orta", "Yüksek"]).optional(),
  personality_type: z.enum(["Analizci", "Kaşif", "Diplomat", "Yönetici"]).optional(),
});

// 🔹 LOGIN SCHEMA
export const loginSchema = z.object({
  email: z.string().email("Geçersiz e-posta formatı"),
  password: z.string().min(1, "Şifre gereklidir"),
});

// TypeScript tiplerini de dışarı aktarıyoruz (Opsiyonel ama iyi bir alışkanlık)
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;