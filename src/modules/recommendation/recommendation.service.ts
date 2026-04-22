import { prisma } from '../../config/prisma';
import { RecommendationEngine } from './recommendation.logic';

// const prisma satırını sildik çünkü yukarıdaki importtan geliyor.
const engine = new RecommendationEngine();

export class RecommendationService {
  async getPersonalizedSuggestions(userId: string) {
    // 1. ADIM: String olan userId'yi Number'a çeviriyoruz (Çünkü DB'de Int)
    const numericUserId = Number(userId);

    if (isNaN(numericUserId)) {
      throw new Error("Geçersiz kullanıcı kimliği.");
    }

    // 2. ADIM: Tablo isimlerini schema.prisma'daki küçük harf halleriyle güncelledik
    const profile = await prisma.user_profiles.findUnique({
      where: { user_id: numericUserId }
    });

    const testScores = await prisma.user_test_scores.findUnique({
      where: { user_id: numericUserId }
    });

    const careerSuggestion = await prisma.user_career_suggestions.findFirst({
      where: { user_id: numericUserId },
      orderBy: { id: 'desc' }
    });

    // Veri kontrolü
    if (!profile || !testScores || !careerSuggestion) {
      throw new Error("Eksik veri: Lütfen önce profilinizi ve testlerinizi tamamlayın.");
    }

    // 3. ADIM: İlişki (include) isimlerini schema.prisma'ya göre düzelttik
    // Şemanda 'departments' -> 'universities' -> 'cities' şeklinde bir zincir var.
    const matchedDepartments = await prisma.departments.findMany({
      where: {
        dept_name: {
          contains: careerSuggestion.occupation_name,
          mode: 'insensitive'
        },
      },
      include: {
        universities: { // Şemada 'universities' olarak geçiyor (university değil)
          include: {
            cities: true // Şemada 'cities' olarak geçiyor (city değil)
          }
        }
      }
    });

    // 4. ADIM: Hesapla ve Sırala
    const results = engine.calculate(profile, testScores, matchedDepartments);
    return results.sort((a, b) => b.match_score - a.match_score).slice(0, 10);
  }
}   dosyanın şuan durumu bu şekilde hatalı kısmı bulup bana at