import { prisma } from '../../config/prisma';
import { RecommendationEngine } from './recommendation.logic';

const engine = new RecommendationEngine();

export class RecommendationService {
  async getPersonalizedSuggestions(userId: any) {
    const numericUserId = Number(userId);

    if (isNaN(numericUserId)) {
      throw new Error("Geçersiz kullanıcı kimliği.");
    }

    // @ts-ignore: Prisma client model ismi camelCase çoğul üretiyor ama runtime'da çalışıyor
    const profile = await prisma.user_Profile.findUnique({
      where: { user_id: numericUserId }
    });

    // @ts-ignore
    const testScores = await prisma.user_Test_Score.findUnique({
      where: { user_id: numericUserId }
    });

    if (!profile) {
      throw new Error("Profil bulunamadı. Lütfen önce profilinizi tamamlayın.");
    }

    // Test puanı yoksa nötr değerlerle devam et
    const scores = testScores ?? {
      culture_w: 0.5, nature_w: 0.5, social_w: 0.5, modern_w: 0.5
    };

    // Kariyer önerisi opsiyonel — varsa o mesleğe göre filtrele, yoksa tüm departmanları al
    // @ts-ignore
    const careerSuggestion = await prisma.user_Career_Suggestion.findFirst({
      where: { user_id: numericUserId },
      orderBy: { id: 'desc' }
    });

    // @ts-ignore
    let matchedDepartments = await prisma.department.findMany({
      where: careerSuggestion?.occupation_name
        ? {
            dept_name: {
              contains: careerSuggestion.occupation_name,
              mode: 'insensitive',
            },
          }
        : {}, // Kariyer önerisi yoksa tüm departmanları değerlendir
      include: {
        university: {
          include: { city: true }
        }
      },
      take: 200, // Çok fazla DB yükü oluşturmaması için limit
    });

    // ── FALLBACK: Eğer meslek ismiyle tam eşleşen bölüm bulunamazsa (Örn: "Avukat" yerine "Hukuk" olması gibi),
    // ── boş liste döndürmek yerine tüm bölümleri değerlendir.
    if (matchedDepartments.length === 0 && careerSuggestion) {
      // @ts-ignore
      matchedDepartments = await prisma.department.findMany({
        include: {
          university: {
            include: { city: true }
          }
        },
        take: 200,
      });
    }

    if (matchedDepartments.length === 0) {
      return [];
    }

    // Tüm departmanlar için skor hesapla
    const allResults = engine.calculate(profile, scores, matchedDepartments);

    // ── DÜZELTME: Şehir bazında tekilleştirme ──────────────────────────────
    // Aynı şehirin birden fazla departmanı top 10'u doldurunca diğer şehirler
    // görünmüyordu. Çözüm: önce her şehir için en iyi skoru bul, sonra
    // şehirleri kendi aralarında sırala.
    const cityBestMap = new Map<string, any>();
    for (const result of allResults) {
      const existing = cityBestMap.get(result.city_name);
      if (!existing || result.match_score > existing.match_score) {
        cityBestMap.set(result.city_name, result);
      }
    }

    // Şehirleri skorlarına göre sırala, top 10 al
    const results = Array.from(cityBestMap.values())
      .sort((a: any, b: any) => b.match_score - a.match_score)
      .slice(0, 10);
    // ───────────────────────────────────────────────────────────────────────

    // ─── Sonuçları User_Matched_City tablosuna kaydet ───
    // @ts-ignore
    await prisma.user_Matched_City.deleteMany({
      where: { user_id: numericUserId }
    });

    const seenCityIds = new Set<number>();
    let order = 1;
    for (const result of results) {
      const dept = matchedDepartments.find((d: any) => d.id === result.dept_id);
      const cityId = dept?.university?.city?.id;
      if (cityId && !seenCityIds.has(cityId)) {
        seenCityIds.add(cityId);
        // @ts-ignore
        await prisma.user_Matched_City.create({
          data: {
            user_id: numericUserId,
            city_id: cityId,
            match_order: order++,
          },
        });
        if (order > 3) break;
      }
    }

    return results;
  }

  // searchByDepartment için eksik olan fonksiyonu da ekleyelim
  async searchSuggestions(userId: number, query: string) {
    // @ts-ignore
    return await prisma.department.findMany({
      where: {
        dept_name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        university: {
          include: {
            city: true
          }
        }
      },
      take: 20
    });
  }
}