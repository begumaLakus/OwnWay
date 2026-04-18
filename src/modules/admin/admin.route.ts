import { FastifyInstance } from "fastify";
import { getUsersHandler, deleteUserHandler } from "./admin.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { adminOnly } from "./admin.middleware";

export default async function adminRoutes(app: FastifyInstance) {
  // Bu rotaların tamamı önce giriş (auth), sonra admin yetkisi (adminOnly) ister
  app.get("/users", { preHandler: [authMiddleware, adminOnly] }, getUsersHandler);
  
  app.delete("/users/:id", { preHandler: [authMiddleware, adminOnly] }, deleteUserHandler);
}