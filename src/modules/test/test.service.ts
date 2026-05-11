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
    // Frontend'den gelen puanlar 0-100 arasında. DB'ye 0-1 arası "weight" olarak kaydediyoruz.
    const normalizedScores = {
      culture_w: input.culture_w / 100,
      nature_w: input.nature_w / 100,
      social_w: input.social_w / 100,
      modern_w: input.modern_w / 100,
    };

    // @ts-ignore: Prisma transaction client model isimleri (user_Test_Score, city, user_Matched_City)
    await tx.user_Test_Score.upsert({
      where: { user_id: userId },
      update: normalizedScores,
      create: {
        user_id: userId,
        ...normalizedScores,
      },
    });

    // 2. ADIM: Tüm Şehir Verilerini Çek
    // @ts-ignore
    const allCities = await tx.city.findMany();

    // 3. ADIM: Eşleştirme Algoritması (Euclidean Distance / Öklid Mesafesi)
    const recommendations = allCities.map((city: any) => {
      // Şehir skorları 0-5 arası (örneğin 4.05, 3.66 vs.)
      const cultureScore = Number(city.culture_score || 0);
      const natureScore = Number(city.nature_score || 0);
      const socialScore = Number(city.social_score || 0);
      const modernScore = Number(city.modern_score || 0);

      // Kullanıcının 0-1 arası weight değerlerini 0-5 arasına genişleterek şehirle kıyaslıyoruz
      const userCulture = normalizedScores.culture_w * 5;
      const userNature = normalizedScores.nature_w * 5;
      const userSocial = normalizedScores.social_w * 5;
      const userModern = normalizedScores.modern_w * 5;

      // Matematiksel fark analizi: Kullanıcı tercihi ile şehir özellikleri arasındaki mesafe
      const score = Math.sqrt(
        Math.pow(cultureScore - userCulture, 2) +
        Math.pow(natureScore - userNature, 2) +
        Math.pow(socialScore - userSocial, 2) +
        Math.pow(modernScore - userModern, 2)
      );

      return { 
        id: city.id, 
        city_name: city.city_name, 
        match_score: score 
      };
    });

    // 4. ADIM: En iyi 3 eşleşmeyi seç (Skor ne kadar düşükse uyum o kadar yüksektir)
    const topCities = recommendations
      .sort((a: any, b: any) => a.match_score - b.match_score)
      .slice(0, 3);

    // 5. ADIM: Veritabanında Kalıcılığı Sağla (DB Synchronization)
    // Önce bu kullanıcıya ait eski önerileri siliyoruz
    // @ts-ignore
    await tx.user_Matched_City.deleteMany({
      where: { user_id: userId }
    });

    // Yeni önerileri toplu olarak (Bulk Insert) kaydediyoruz
    // @ts-ignore
    await tx.user_Matched_City.createMany({
      data: topCities.map((city: any, index: number) => ({
        user_id: userId,
        city_id: city.id,
        match_order: index + 1 // 1., 2. ve 3. sıra
      }))
    });

    // Frontend'in anında göstermesi için sonuçları döndür
    return topCities;
  });
};