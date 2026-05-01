import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { ZodError } from "zod";

import testRoutes from "./modules/test/test.route";
import authRoutes from "./modules/auth/auth.route";
import adminRoutes from "./modules/admin/admin.route";
import universityRoutes from "./modules/university/university.route";
import userRoutes from "./modules/user/user.route"; 
import { recommendationRoutes } from "./modules/recommendation/recommendation.route";

import { env } from "./config/env";
import { AppError } from "./utils/AppError";

export const buildApp = () => {
  const app = Fastify({ logger: true });

  // 🔹 CORS Ayarı: Şeyma'nın frontend'den (localhost:3000 vb.) sorunsuz bağlanmasını sağlar
  app.register(cors, {
    origin: true, 
    methods: ["GET", "POST", "PUT", "DELETE"],
  });

  // 🔹 JWT Ayarı
  app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // 🔹 KRİTİK DECORATOR: authenticate middleware'inin çalışması için bu şart!
  // Bu sayede request.user ve request.jwtVerify her yerde kullanılabilir hale gelir.
  app.decorate("authenticate", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // 🔹 Modüller Kaydediliyor (Prefix'ler standartlaştırıldı)
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(adminRoutes, { prefix: "/api/admin" });
  app.register(universityRoutes, { prefix: "/api/university" });
  app.register(userRoutes, { prefix: "/api/user" });
  app.register(recommendationRoutes, { prefix: "/api/recommendation" });
  app.register(testRoutes, { prefix: "/api/test" });

  // 🔹 GLOBAL HATA YÖNETİMİ
  app.setErrorHandler((error, request, reply) => {
    // Kendi fırlattığımız hatalar (AppError)
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
        data: null,
      });
    }

    // Zod Doğrulama hataları
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        message: "Veri doğrulama hatası",
        errors: error.flatten().fieldErrors, // Detaylı hata mesajı
        data: null,
      });
    }

    // Beklenmedik sunucu hataları
    const err = error as Error;
    return reply.status(500).send({
      success: false,
      message: err.message || "Sunucu taraflı bir hata oluştu.",
      data: null,
    });
  });

  return app;
};