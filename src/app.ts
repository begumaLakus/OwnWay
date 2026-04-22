import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { ZodError } from "zod";

import authRoutes from "./modules/auth/auth.route";
import adminRoutes from "./modules/admin/admin.route";
import universityRoutes from "./modules/university/university.route";
import userRoutes from "./modules/user/user.route"; 
import { recommendationRoutes } from "./modules/recommendation/recommendation.route";

import { env } from "./config/env";
import { AppError } from "./utils/AppError";

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.register(cors);

  app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // Modüller Kaydediliyor
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(adminRoutes, { prefix: "/api/admin" });
  app.register(universityRoutes, { prefix: "/api/university" });
  app.register(userRoutes, { prefix: "/api/user" });
  app.register(recommendationRoutes, { prefix: "/api/recommendation" }); // Kendi rotanı da kaydet!

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