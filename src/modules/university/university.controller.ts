import { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./university.service";

/**
 * @description Şehir detaylarını ve içindeki üniversiteleri getiren handler.
 */
export const getDiscoveryHandler = async (
  request: FastifyRequest<{ Params: { cityName: string } }>,
  reply: FastifyReply
) => {
  try {
    const { cityName } = request.params;

    // 1. KONTROL: Şehir ismi boş mu?
    if (!cityName || cityName.trim() === "") {
      return reply.status(400).send({
        success: false,
        message: "Lütfen geçerli bir şehir ismi belirtin.",
      });
    }

    // 2. SERVİS ÇAĞRISI: Şehir ismini decode ediyoruz (URL'den gelen Türkçe karakterler için)
    const decodedCityName = decodeURIComponent(cityName);
    const data = await service.getCityDiscoveryService(decodedCityName);

    // 3. VERİ KONTROLÜ: Eğer servis null döndüyse şehir bulunamamıştır
    if (!data) {
      return reply.status(404).send({
        success: false,
        message: `${decodedCityName} isminde bir şehir veritabanında bulunamadı.`,
      });
    }

    return reply.status(200).send({
      success: true,
      message: `${decodedCityName} şehri ve üniversite verileri başarıyla getirildi.`,
      data,
    });

  } catch (error: any) {
    return reply.status(500).send({
      success: false,
      message: "Şehir verileri getirilirken bir hata oluştu.",
      error: error.message
    });
  }
};