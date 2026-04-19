import { prisma } from "../../config/prisma";

export const getCityDiscoveryData = async (cityName: string) => {
  return prisma.city.findFirst({
    where: {
      city_name: {
        equals: cityName,
        mode: 'insensitive' // Büyük-küçük harf hatasını önler
      }
    },
    include: {
      universities: {
        include: {
          departments: {
            // Şeyma'nın istediği o 5 ana bölümü filtreliyoruz
            where: {
              dept_name: {
                in: ["Bilgisayar Mühendisliği", "Tıp", "Hukuk", "Psikoloji", "İlahiyat"]
              }
            }
          }
        }
      }
    }
  });
};