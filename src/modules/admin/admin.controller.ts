import { FastifyRequest, FastifyReply } from "fastify";
import { getAllUsersService, deleteUserByAdmin } from "./admin.service";

// Tüm kullanıcıları listeleme
export const getUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const users = await getAllUsersService();
  return { success: true, data: users };
};

// Kullanıcı silme
export const deleteUserHandler = async (request: any, reply: FastifyReply) => {
  const { id } = request.params; // URL'den gelen ID (örn: "4")

  // 🔥 KRİTİK DÜZELTME: 
  // Şemada ID'ler Int olduğu için String gelen ID'yi sayıya çevirmeliyiz.
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return reply.status(400).send({
      success: false,
      message: "Geçersiz kullanıcı ID formatı!"
    });
  }

  await deleteUserByAdmin(numericId);
  
  return { 
    success: true, 
    message: "Kullanıcı ve bağlı tüm verileri başarıyla silindi." 
  };
};