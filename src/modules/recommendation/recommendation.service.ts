import { PrismaClient } from '@prisma/client';
import { RecommendationEngine } from './recommendation.logic';

const prisma = new PrismaClient();
const engine = new RecommendationEngine();

export class RecommendationService {
  async getPersonalizedSuggestions(userId: string) {
    
    const profile = await prisma.user_Profiles.findUnique({ where: { user_id: userId } });
    const testScores = await prisma.user_Test_Scores.findUnique({ where: { user_id: userId } });
    
    // Kariyer önerisini çek 
    const careerSuggestion = await prisma.user_Career_Suggestions.findFirst({
      where: { user_id: userId },
      orderBy: { id: 'desc' } // En son yapılan test sonucu
    });

    if (!profile || !testScores || !careerSuggestion) {
      throw new Error("Eksik veri: Lütfen önce profilinizi ve testlerinizi tamamlayın.");
    }

    // 2. Mesleğe Uygun Bölümleri ve Şehirleri Çek 
    const matchedDepartments = await prisma.departments.findMany({
      where: {
        dept_name: { contains: careerSuggestion.occupation_name, mode: 'insensitive' },
        // Sayısalcıya sözel önermemek için Nisa'nın 'dept_type' verisini kullanabilirsin
      },
      include: {
        university: {
          include: { city: true }
        }
      }
    });

    // 3. Hesapla ve Sırala
    const results = engine.calculate(profile, testScores, matchedDepartments);
    return results.sort((a, b) => b.match_score - a.match_score).slice(0, 10);
  }
}