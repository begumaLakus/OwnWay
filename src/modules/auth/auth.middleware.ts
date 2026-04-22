import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Kullanıcının giriş yapıp yapmadığını kontrol eden middleware.
 * Eğer token geçerliyse request.user içine kullanıcı bilgilerini koyar.
 */
export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Fastify-jwt eklentisini kullanarak token'ı doğrular
    await request.jwtVerify();
  } catch (err) {
    // Eğer token yoksa veya geçersizse 401 hatası döner
    return reply.status(401).send({
      success: false,
      message: "Yetkisiz erişim! Lütfen önce giriş yapın.",
      data: null,
    });
  }
};