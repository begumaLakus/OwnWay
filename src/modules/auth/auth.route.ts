import { FastifyInstance } from "fastify";
import { registerController, loginController } from "./auth.controller";
import { authMiddleware } from "./auth.middleware";
import { meController } from "./auth.controller";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/register", registerController);
  app.post("/login", loginController);

  app.get("/me",{preHandler:authMiddleware},meController);
}