import { FastifyInstance } from "fastify";
import { getUsersHandler, deleteUserHandler } from "./admin.controller";
import { authenticate } from "../auth/auth.middleware";
import { adminOnly } from "./admin.middleware";

export default async function adminRoutes(app: FastifyInstance) {
  /**
   * preHandler Zinciri:
   * 1. authenticate: 'Sen kimsin?' (Token doğrular)
   * 2. adminOnly: 'Yetkin var mı?' (Rol doğrular)
   */

  // Tüm kullanıcıları listeleme
  app.get(
    "/users", 
    { preHandler: [authenticate, adminOnly] }, 
    getUsersHandler
  );

  // Kullanıcı silme
  // Unutma: Controller'da 'id'yi parseInt ile sayıya çevirecek şekilde güncelledik.
  app.delete(
    "/users/:id", 
    { preHandler: [authenticate, adminOnly] }, 
    deleteUserHandler
  );
}