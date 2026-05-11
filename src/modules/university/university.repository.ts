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
            where: {
              dept_name: {
                in: ["Bilgisayar Mühendisliği", "Tıp", "Hukuk", "Psikoloji", "İlahiyat"],
                // Eğer veritabanında yazım farklılıkları varsa buraya da mode eklenebilir
              }
            },
            // Şeyma'ya taban puanlarını da gösterelim mi? 
            // Select eklemiyoruz ki tüm departman verileri (base_rank vb.) gitsin.
          }
        }
      }
    }
  });
};