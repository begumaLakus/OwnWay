import { processTestResults } from "./test.service";

export const submitTestHandler = async (request: any, reply: any) => {
  const { culture_w, nature_w, social_w, modern_w } = request.body;

  // 1. Adım: Eksik veri kontrolü (Validation)
  // Şeyma'dan gelen verilerin varlığını kontrol ediyoruz
  if (
    culture_w === undefined || 
    nature_w === undefined || 
    social_w === undefined || 
    modern_w === undefined
  ) {
    return reply.status(400).send({
      success: false,
      error: "INCOMPLETE_TEST",
      message: "Test sonuçları tam olarak hesaplanamadı. Lütfen tüm soruları yanıtladığınızdan emin olun."
    });
  }

  try {
    const userId = request.user.id;

    // 2. Adım: Servis katmanını çağır ve dönen sonuçları yakala!
    // processTestResults fonksiyonun hem DB'ye kayıt yapmalı hem de şehirleri dönmeli.
    const recommendations = await processTestResults(userId, request.body);
    
    // 3. Adım: Başarılı yanıtı veri (data) ile birlikte gönder
    return reply.send({
      success: true,
      message: "Test başarıyla güncellendi! Yeni önerilerin hazır.",
      data: recommendations // Frontend'in beklediği asıl şehir listesi burası
    });

  } catch (error: any) {
    // Hata durumunda loglama yap ve kullanıcıya bildir
    request.log.error(error);
    return reply.status(500).send({ 
      success: false, 
      message: "İşlem sırasında bir hata oluştu.",
      error: error.message 
    });
  }
};