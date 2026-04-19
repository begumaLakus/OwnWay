import { FastifyInstance } from "fastify";
import * as controller from "./user.controller";
import { authenticate } from "../auth/auth.middleware"; // Giriş kontrolü için

export default async function userRoutes(app: FastifyInstance) {
  // Bu rotaların tamamı giriş yapmış kullanıcı gerektirir
  app.addHook("preHandler", authenticate);

  // Profil bilgilerini güncelleme yolu
  app.put("/profile", controller.updateProfileHandler);

  // Test sonuçlarını kaydetme yolu
  app.post("/test-scores", controller.saveTestScoreHandler);
}