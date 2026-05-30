import { FastifyInstance } from "fastify";
import {
  getUsersHandler,
  deleteUserHandler,
  updateUserRoleHandler,
  getDashboardStatsHandler,
  getCitiesHandler,
  createCityHandler,
  updateCityHandler,
  deleteCityHandler,
  createUniversityHandler,
  updateUniversityHandler,
  deleteUniversityHandler,
  createDepartmentHandler,
  updateDepartmentHandler,
  deleteDepartmentHandler,
} from "./admin.controller";
import { authenticate } from "../auth/auth.middleware";
import { adminOnly } from "./admin.middleware";

export default async function adminRoutes(app: FastifyInstance) {
  const guard = { preHandler: [authenticate, adminOnly] };

  // ─── DASHBOARD ──────────────────────────────────────────
  app.get("/stats", guard, getDashboardStatsHandler);

  // ─── KULLANICILAR ───────────────────────────────────────
  app.get("/users", guard, getUsersHandler);
  app.delete("/users/:id", guard, deleteUserHandler);
  app.patch("/users/:id/role", guard, updateUserRoleHandler);

  // ─── ŞEHİRLER ──────────────────────────────────────────
  app.get("/cities", guard, getCitiesHandler);
  app.post("/cities", guard, createCityHandler);
  app.put("/cities/:id", guard, updateCityHandler);
  app.delete("/cities/:id", guard, deleteCityHandler);

  // ─── ÜNİVERSİTELER ─────────────────────────────────────
  app.post("/universities", guard, createUniversityHandler);
  app.put("/universities/:id", guard, updateUniversityHandler);
  app.delete("/universities/:id", guard, deleteUniversityHandler);

  // ─── BÖLÜMLER ───────────────────────────────────────────
  app.post("/departments", guard, createDepartmentHandler);
  app.put("/departments/:id", guard, updateDepartmentHandler);
  app.delete("/departments/:id", guard, deleteDepartmentHandler);
}