import { PrismaClient } from "@prisma/client";
import { SubmitTestInput } from "./test.schema";

const prisma = new PrismaClient();

// İsim burada tanımlanıyor:
export const processTestResults = async (userId: number, input: SubmitTestInput) => {
  return await prisma.$transaction(async (tx) => {
    // Upsert mantığı: Kayıt varsa güncelle (update), yoksa oluştur (create)
    const scores = await tx.user_Test_Score.upsert({
      where: { user_id: userId },
      update: {
        culture_w: input.culture_w,
        nature_w: input.nature_w,
        social_w: input.social_w,
        modern_w: input.modern_w,
      },
      create: {
        user_id: userId,
        culture_w: input.culture_w,
        nature_w: input.nature_w,
        social_w: input.social_w,
        modern_w: input.modern_w,
      },
    });
    return scores;
  });
};