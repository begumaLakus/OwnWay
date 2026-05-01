import { PrismaClient } from "@prisma/client";
import { SubmitTestInput } from "./test.schema";

const prisma = new PrismaClient();

/**
 * Kullanıcı test sonuçlarını işler:
 * 1. Puanları kaydeder/günceller.
 * 2. Şehirlerle eşleştirme algoritmasını çalıştırır.
 * 3. Eski önerileri temizleyip yenilerini DB'ye kaydeder.
 * 4. Önerilen ilk 3 şehri döndürür.
 */
export const processTestResults = async (userId: number, input: SubmitTestInput) => {
  return await prisma.$transaction(async (tx) => {
    
    // 1. ADIM: Test Puanlarını Kaydet (Persistence)
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

    // 2. ADIM: Tüm Şehir Verilerini Çek
    const allCities = await tx.city.findMany();

    // 3. ADIM: Eşleştirme Algoritması (Euclidean Distance / Öklid Mesafesi)
    const recommendations = allCities.map((city) => {
      // Decimal tiplerini güvenli bir şekilde Number'a çeviriyoruz
      const cultureScore = Number(city.culture_score || 0);
      const natureScore = Number(city.nature_score || 0);
      const socialScore = Number(city.social_score || 0);
      const modernScore = Number(city.modern_score || 0);

      // Matematiksel fark analizi: Kullanıcı tercihi ile şehir özellikleri arasındaki mesafe
      const score = Math.sqrt(
        Math.pow(cultureScore - input.culture_w, 2) +
        Math.pow(natureScore - input.nature_w, 2) +
        Math.pow(socialScore - input.social_w, 2) +
        Math.pow(modernScore - input.modern_w, 2)
      );

      return { 
        id: city.id, 
        city_name: city.city_name, 
        match_score: score 
      };
    });

    // 4. ADIM: En iyi 3 eşleşmeyi seç (Skor ne kadar düşükse uyum o kadar yüksektir)
    const topCities = recommendations
      .sort((a, b) => a.match_score - b.match_score)
      .slice(0, 3);

    // 5. ADIM: Veritabanında Kalıcılığı Sağla (DB Synchronization)
    // Önce bu kullanıcıya ait eski önerileri siliyoruz
    await tx.user_Matched_City.deleteMany({
      where: { user_id: userId }
    });

    // Yeni önerileri toplu olarak (Bulk Insert) kaydediyoruz
    await tx.user_Matched_City.createMany({
      data: topCities.map((city, index) => ({
        user_id: userId,
        city_id: city.id,
        match_order: index + 1 // 1., 2. ve 3. sıra
      }))
    });

    // Frontend'in anında göstermesi için sonuçları döndür
    return topCities;
  });
};