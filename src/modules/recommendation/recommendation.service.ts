import { prisma } from '../../config/prisma';
import { RecommendationEngine } from './recommendation.logic';

const engine = new RecommendationEngine();

export class RecommendationService {
  async getPersonalizedSuggestions(userId: any) {
    // 1. ADIM: ID Dönüşümü (Controller'dan gelen her ihtimale karşı garantiye alıyoruz)
    const numericUserId = Number(userId);

    if (isNaN(numericUserId)) {
      throw new Error("Geçersiz kullanıcı kimliği.");
    }

    // 2. ADIM: Tablo isimlerini schema.prisma'daki MODEL isimleriyle çekiyoruz
    // Prisma model isimlerini (User_Profile) kullanır, DB tablo isimlerini (user_profiles) değil.
    const profile = await prisma.user_Profile.findUnique({
      where: { user_id: numericUserId }
    });

    const testScores = await prisma.user_Test_Score.findUnique({
      where: { user_id: numericUserId }
    });

    const careerSuggestion = await prisma.user_Career_Suggestion.findFirst({
      where: { user_id: numericUserId },
      orderBy: { id: 'desc' }
    });

    // Veri kontrolü
    if (!profile || !testScores || !careerSuggestion) {
      throw new Error("Eksik veri: Lütfen önce profilinizi ve testlerinizi tamamlayın.");
    }

    // 3. ADIM: İlişki İsimlerini Şemaya Göre Mühürledik
    // Senin Department modelinde University ile olan bağın adı: 'university'
    // University modelinde City ile olan bağın adı: 'city'
    const matchedDepartments = await prisma.department.findMany({
      where: {
        dept_name: {
          contains: careerSuggestion.occupation_name || "",
          mode: 'insensitive'
        },
      },
      include: {
        university: { 
          include: {
            city: true 
          }
        }
      }
    });

    // 4. ADIM: Hesapla ve Sırala
    // Engine içine gönderirken verilerin hazır olduğundan eminiz.
    const results = engine.calculate(profile, testScores, matchedDepartments);
    
    return results
      .sort((a: any, b: any) => b.match_score - a.match_score)
      .slice(0, 10);
  }

  // searchByDepartment için eksik olan fonksiyonu da ekleyelim
  async searchSuggestions(userId: number, query: string) {
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