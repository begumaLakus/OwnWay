import { processTestResults, saveCareerSuggestions } from "./test.service";

export const submitTestHandler = async (request: any, reply: any) => {
  const { culture_w, nature_w, social_w, modern_w } = request.body;

  if (culture_w === undefined || nature_w === undefined || social_w === undefined || modern_w === undefined) {
    return reply.status(400).send({
      success: false,
      error: "INCOMPLETE_TEST",
      message: "Test sonuçları tam olarak hesaplanamadı."
    });
  }

  try {
    const userId = request.user.id;
    const recommendations = await processTestResults(userId, request.body);
    return reply.send({
      success: true,
      message: "Test başarıyla güncellendi! Yeni önerilerin hazır.",
      data: recommendations
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ success: false, message: "İşlem sırasında bir hata oluştu.", error: error.message });
  }
};

export const submitCareerHandler = async (request: any, reply: any) => {
  try {
    const userId = request.user.id;
    const { occupations } = request.body;

    if (!occupations || occupations.length === 0) {
      return reply.status(400).send({ success: false, message: "Meslek listesi boş olamaz." });
    }

    await saveCareerSuggestions(userId, occupations);

    return reply.send({ success: true, message: "Meslek önerilerin kaydedildi! 🎉", data: occupations });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ success: false, message: "Meslek önerileri kaydedilirken bir hata oluştu.", error: error.message });
  }
};