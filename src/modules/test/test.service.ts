import { PrismaClient } from "@prisma/client";
import { SubmitTestInput } from "./test.schema";

const prisma = new PrismaClient();

export const processTestResults = async (userId: number, input: SubmitTestInput) => {
  return await prisma.$transaction(async (tx) => {
    
    // 1. ADIM: Puan Kaydı
    // Şemandaki model adı 'User_Test_Score' olduğu için 'user_Test_Score' olarak erişilir.
    await tx.user_Test_Score.upsert({
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

    // 2. ADIM: Şehirleri Çek
    // Şemandaki model adı 'City' olduğu için 'city' olarak erişilir.
    const allCities = await tx.city.findMany();

    // 3. ADIM: Algoritma
    const recommendations = allCities.map((city) => {
      // Sütun isimlerin şemanda: city_name, culture_score, nature_score vb.
      const cultureScore = Number(city.culture_score || 0);
      const natureScore = Number(city.nature_score || 0);
      const socialScore = Number(city.social_score || 0);
      const modernScore = Number(city.modern_score || 0);

      const score = Math.sqrt(
        Math.pow(cultureScore - input.culture_w, 2) +
        Math.pow(natureScore - input.nature_w, 2) +
        Math.pow(socialScore - input.social_w, 2) +
        Math.pow(modernScore - input.modern_w, 2)
      );

      return {
        id: city.id,
        city_name: city.city_name, // Şemanda city_name olarak tanımlı
        match_score: score
      };
    });

    // 4. ADIM: Sıralama ve Sonuç (En düşük fark en iyi eşleşmedir)
    const topCities = recommendations
      .sort((a, b) => a.match_score - b.match_score)
      .slice(0, 3);

    return topCities;
  });
};