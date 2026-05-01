import { FastifyInstance } from "fastify";
import * as controller from "./user.controller";
import { authenticate } from "../auth/auth.middleware"; // Giriş kontrolü için

export default async function userRoutes(app: FastifyInstance) {
  /**
   * Giriş yapmış kullanıcı kontrolü (Middleware)
   * 'as any' kullanımı, authenticate fonksiyonunun Fastify kancalarıyla 
   * tip uyumsuzluğu yaşamaması için eklenmiştir.
   */
  app.addHook("preHandler", authenticate as any);

  /**
   * @route   GET /profile
   * @desc    Kullanıcının profil verilerini ve şehir önerilerini getirir.
   *          (Profil sayfasındaki 404 hatasını bu satır çözer.)
   */
  app.get("/profile", controller.getUserProfileHandler);

  /**
   * @route   PUT /profile
   * @desc    Profil bilgilerini günceller.
   */
  app.put("/profile", controller.updateProfileHandler);

  /**
   * @route   POST /test-scores
   * @desc    Test puanlarını kaydeder ve şehir eşleşmesini başlatır.
   */
  app.post("/test-scores", controller.saveTestScoreHandler);
}