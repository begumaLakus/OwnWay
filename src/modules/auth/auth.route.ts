import { FastifyInstance } from "fastify";
import { registerController, loginController, meController } from "./auth.controller";
import { authenticate } from "./auth.middleware"; // Fonksiyon adını 'authenticate' olarak düzelttik

export default async function authRoutes(app: FastifyInstance) {
  // 🔹 Kayıt Ol (Public)
  app.post("/register", registerController);

  // 🔹 Giriş Yap (Public)
  app.post("/login", loginController);

  // 🔹 Profil Bilgilerim (Protected - Sadece Tokenı Olanlar)
  app.get("/me", { preHandler: [authenticate] }, meController);
}