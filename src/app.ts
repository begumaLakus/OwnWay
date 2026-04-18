import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { ZodError } from "zod";

import authRoutes from "./modules/auth/auth.route";
import adminRoutes from "./modules/admin/admin.route";
import universityRoutes from "./modules/university/university.route"; // 1. University route import edildi
import { env } from "./config/env";
import { AppError } from "./utils/AppError";

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.register(cors);

  app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // 2. Modüller Kaydediliyor
  app.register(authRoutes, { prefix: "/api/auth" }); // Daha düzenli olması için auth'a prefix ekledik
  app.register(adminRoutes, { prefix: "/api/admin" });
  app.register(universityRoutes, { prefix: "/api/university" }); // 3. Harita/Keşif modülü kaydedildi

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
        data: null,
      });
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        message: error.issues[0]?.message,
        data: null,
      });
    }

    const err = error as Error;

    return reply.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
      data: null,
    });
  });

  return app;
};