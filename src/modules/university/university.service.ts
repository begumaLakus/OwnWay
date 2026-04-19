import * as repo from "./university.repository";
import { AppError } from "../../utils/AppError";

export const getCityDiscoveryService = async (cityName: string) => {
  const cityData = await repo.getCityDiscoveryData(cityName);

  if (!cityData) {
    throw new AppError("Aradığınız şehir sistemde kayıtlı değil.", 404);
  }

  // Şeyma'nın Box yapısı için veriyi organize ediyoruz
  return {
    city_info: {
      name: cityData.city_name,
      population: cityData.total_student_count, // Nüfus bilgisi olarak öğrenci sayısı
      scores: {
        economy: { score: cityData.total_cost_index, label: "Ekonomi" },
        cultural: { score: cityData.culture_score, label: "Kültürel" },
        nature: { score: cityData.nature_score, label: "Doğal Güzellik" },
        modern: { score: cityData.modern_score, label: "Medeniyet" },
        social: { score: cityData.social_score, label: "Sosyal" }
      }
    },
    universities: cityData.universities.map(uni => ({
      name: uni.uni_name,
      features: `${uni.uni_type} - ${uni.has_campus ? 'Yerleşke Mevcut' : 'Şehir Kampüsü'} - ${uni.campus_count} Yerleşke`,
      programs: uni.departments.map(dept => ({
        id: dept.dept_id,
        name: dept.dept_name,
        details: {
          rank: dept.base_rank,
          score: dept.base_score,
          lang: dept.language,
          quota: dept.quota,
          gender_ratio: `K:%${dept.female_student_count} / E:%${dept.male_student_count}`
        }
      }))
    }))
  };
};