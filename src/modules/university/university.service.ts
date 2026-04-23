import * as repo from "./university.repository";
import { AppError } from "../../utils/AppError";

export const getCityDiscoveryService = async (cityName: string) => {
  const cityData = await repo.getCityDiscoveryData(cityName);

  if (!cityData) {
    throw new AppError("Aradığınız şehir sistemde kayıtlı değil.", 404);
  }

  // 🔥 KRİTİK DÜZELTME: Decimal değerleri Number'a çeviriyoruz ki frontend patlamasın
  return {
    city_info: {
      name: cityData.city_name,
      population: cityData.total_student_count,
      scores: {
        economy: { score: Number(cityData.total_cost_index || 0), label: "Ekonomi" },
        cultural: { score: Number(cityData.culture_score || 0), label: "Kültürel" },
        nature: { score: Number(cityData.nature_score || 0), label: "Doğal Güzellik" },
        modern: { score: Number(cityData.modern_score || 0), label: "Medeniyet" },
        social: { score: Number(cityData.social_score || 0), label: "Sosyal" }
      }
    },
    universities: cityData.universities.map(uni => ({
      name: uni.uni_name,
      features: `${uni.uni_type} - ${uni.has_campus ? 'Yerleşke Mevcut' : 'Şehir Kampüsü'}`,
      campus_info: `${uni.campus_count || 0} Yerleşke Bulunuyor`,
      programs: uni.departments.map(dept => {
        // Cinsiyet oranını daha okunaklı yapalım (Toplamı alıp yüzdeye çevirebiliriz ama şu anki haliyle de sayıları garantiye alalım)
        const female = Number(dept.female_student_count || 0);
        const male = Number(dept.male_student_count || 0);
        
        return {
          id: dept.id,
          name: dept.dept_name,
          details: {
            rank: dept.base_rank || "Girilmemiş",
            score: Number(dept.base_score || 0), // Decimal -> Number
            lang: dept.language || "Türkçe",
            quota: dept.quota || 0,
            gender_info: `Kız: ${female} / Erkek: ${male}`
          }
        };
      })
    }))
  };
};