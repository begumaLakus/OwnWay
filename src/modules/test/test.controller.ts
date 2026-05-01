import { processTestResults } from "./test.service";

export const submitTestHandler = async (request: any, reply: any) => {
  const { culture_w, nature_w, social_w, modern_w } = request.body;

  // 1. Eksik veri kontrolü (Profesyonel Hata Mesajı)
  if (culture_w === undefined || nature_w === undefined) {
    return reply.status(400).send({
      success: false,
      error: "INCOMPLETE_TEST",
      message: "Test sonuçları tam olarak hesaplanamadı. Lütfen tüm soruları yanıtladığınızdan emin olun."
    });
  }

  try {
    const userId = request.user.id;
    await processTestResults(userId, request.body);
    
    return reply.send({
      success: true,
      message: "Test başarıyla güncellendi! Yeni önerilerin hazır."
    });
  } catch (error) {
    return reply.status(500).send({ success: false, message: "Veri kaydedilirken bir sorun oluştu." });
  }
};