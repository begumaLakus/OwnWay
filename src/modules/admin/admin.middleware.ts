import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../utils/AppError";

export const adminOnly = async (request: any, reply: FastifyReply) => {
  // 🔹 KRİTİK KONTROL: 
  // authMiddleware (authenticate) request.user'ı doldurur.
  // Ancak token oluşturulurken (login'de) içine 'role' koyduğumuzdan emin olmalıyız.
  
  if (!request.user) {
    throw new AppError("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.", 401);
  }

  // Şemadaki rol isimlendirmesiyle (ADMIN, student vb.) tam eşleşme kontrolü
  if (request.user.role !== "ADMIN") {
    throw new AppError("Bu alana erişim yetkiniz yok. Sadece Adminler girebilir.", 403);
  }
};