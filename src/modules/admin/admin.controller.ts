import { FastifyRequest, FastifyReply } from "fastify";
import { getAllUsersService, deleteUserByAdmin } from "./admin.service";

// Tüm kullanıcıları listeleme
export const getUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const users = await getAllUsersService();
  return { success: true, data: users };
};

// Kullanıcı silme
export const deleteUserHandler = async (request: any, reply: FastifyReply) => {
  const { id } = request.params; // URL'den gelen kullanıcı ID'si
  await deleteUserByAdmin(id);
  return { success: true, message: "Kullanıcı başarıyla silindi" };
};