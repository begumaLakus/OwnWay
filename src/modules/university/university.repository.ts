import { prisma } from "../../config/prisma";

export const getCityDiscoveryData = async (cityName: string) => {
  // @ts-ignore: Prisma client 'cities' olarak üretiyor, runtime'da çalışıyor
  return prisma.city.findFirst({
    where: {
      city_name: {
        equals: cityName,
        mode: 'insensitive' // "istanbul" yazınca da "İstanbul"u bulur
      }
    },
    include: {
      universities: {
        include: {
          departments: {
            orderBy: { base_score: "desc" },
            take: 20, // Üniversite başına en fazla 20 bölüm (taban puana göre sıralı)
          }
        }
      }
    }
  });
};