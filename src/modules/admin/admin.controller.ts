import { FastifyRequest, FastifyReply } from "fastify";
import {
  getAllUsersService,
  deleteUserByAdmin,
  updateUserRoleService,
  getDashboardStatsService,
  getAllCitiesService,
  createCityService,
  updateCityService,
  deleteCityService,
  createUniversityService,
  updateUniversityService,
  deleteUniversityService,
  createDepartmentService,
  updateDepartmentService,
  deleteDepartmentService,
} from "./admin.service";

// ─── KULLANICILAR ──────────────────────────────────────────

export const getUsersHandler = async (_req: FastifyRequest, _rep: FastifyReply) => {
  const users = await getAllUsersService();
  return { success: true, data: users };
};

export const deleteUserHandler = async (request: any, reply: FastifyReply) => {
  const { id } = request.params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId))
    return reply.status(400).send({ success: false, message: "Geçersiz kullanıcı ID!" });
  await deleteUserByAdmin(numericId);
  return { success: true, message: "Kullanıcı silindi." };
};

export const updateUserRoleHandler = async (request: any, reply: FastifyReply) => {
  const { id } = request.params;
  const { role } = request.body as any;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId))
    return reply.status(400).send({ success: false, message: "Geçersiz kullanıcı ID!" });
  const updated = await updateUserRoleService(numericId, role);
  return { success: true, data: updated };
};

// ─── DASHBOARD ─────────────────────────────────────────────

export const getDashboardStatsHandler = async (_req: FastifyRequest, _rep: FastifyReply) => {
  const stats = await getDashboardStatsService();
  return { success: true, data: stats };
};

// ─── ŞEHİRLER ─────────────────────────────────────────────

export const getCitiesHandler = async (_req: FastifyRequest, _rep: FastifyReply) => {
  const cities = await getAllCitiesService();
  return { success: true, data: cities };
};

export const createCityHandler = async (request: any, reply: FastifyReply) => {
  const city = await createCityService(request.body);
  return reply.status(201).send({ success: true, data: city });
};

export const updateCityHandler = async (request: any, reply: FastifyReply) => {
  const { id } = request.params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId))
    return reply.status(400).send({ success: false, message: "Geçersiz şehir ID!" });
  const city = await updateCityService(numericId, request.body);
  return { success: true, data: city };
};

export const deleteCityHandler = async (request: any, reply: FastifyReply) => {
  const { id } = request.params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId))
    return reply.status(400).send({ success: false, message: "Geçersiz şehir ID!" });
  await deleteCityService(numericId);
  return { success: true, message: "Şehir ve bağlı veriler silindi." };
};

// ─── ÜNİVERSİTELER ────────────────────────────────────────

export const createUniversityHandler = async (request: any, reply: FastifyReply) => {
  const uni = await createUniversityService(request.body);
  return reply.status(201).send({ success: true, data: uni });
};

export const updateUniversityHandler = async (request: any, reply: FastifyReply) => {
  const { id } = request.params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId))
    return reply.status(400).send({ success: false, message: "Geçersiz üniversite ID!" });
  const uni = await updateUniversityService(numericId, request.body);
  return { success: true, data: uni };
};

export const deleteUniversityHandler = async (request: any, reply: FastifyReply) => {
  const { id } = request.params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId))
    return reply.status(400).send({ success: false, message: "Geçersiz üniversite ID!" });
  await deleteUniversityService(numericId);
  return { success: true, message: "Üniversite ve bölümleri silindi." };
};

// ─── BÖLÜMLER ─────────────────────────────────────────────

export const createDepartmentHandler = async (request: any, reply: FastifyReply) => {
  const dept = await createDepartmentService(request.body);
  return reply.status(201).send({ success: true, data: dept });
};

export const updateDepartmentHandler = async (request: any, reply: FastifyReply) => {
  const { id } = request.params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId))
    return reply.status(400).send({ success: false, message: "Geçersiz bölüm ID!" });
  const dept = await updateDepartmentService(numericId, request.body);
  return { success: true, data: dept };
};

export const deleteDepartmentHandler = async (request: any, reply: FastifyReply) => {
  const { id } = request.params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId))
    return reply.status(400).send({ success: false, message: "Geçersiz bölüm ID!" });
  await deleteDepartmentService(numericId);
  return { success: true, message: "Bölüm silindi." };
};