import { FastifyInstance } from "fastify";
import { getUsersHandler, deleteUserHandler } from "./admin.controller";
// İsim karmaşasını çözdük: auth.middleware içindeki fonksiyonun adı 'authenticate' idi.
import { authenticate } from "../auth/auth.middleware";
import { adminOnly } from "./admin.middleware";

export default async function adminRoutes(app: FastifyInstance) {
  /**
   * preHandler: [authenticate, adminOnly]
   * 1. authenticate: Kullanıcı giriş yapmış mı (JWT kontrolü)?
   * 2. adminOnly: Giriş yapan kullanıcı admin mi?
   */

  // Tüm kullanıcıları listeleme (Sadece Admin)
  app.get(
    "/users", 
    { preHandler: [authenticate, adminOnly] }, 
    getUsersHandler
  );

  // Kullanıcı silme (Sadece Admin)
  app.delete(
    "/users/:id", 
    { preHandler: [authenticate, adminOnly] }, 
    deleteUserHandler
  );
}