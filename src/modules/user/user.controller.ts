import { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./user.service";

// 🔹 PROFİL GÜNCELLEME HANDLER
export const updateProfileHandler = async (request: any, reply: FastifyReply) => {
  const userId = request.user.user_id; // JWT'den gelen kullanıcı ID'si
  const profileData = request.body;    // Şeyma'nın formdan gönderdiği bilgiler

  const updatedProfile = await service.updateProfileService(userId, profileData);

  return reply.status(200).send({
    success: true,
    message: "Profil başarıyla güncellendi.",
    data: updatedProfile,
  });
};

// 🔹 TEST SONUÇLARINI KAYDETME HANDLER
export const saveTestScoreHandler = async (request: any, reply: FastifyReply) => {
  const userId = request.user.user_id;
  const scores = request.body;

  const savedScore = await service.saveTestScoreService(userId, scores);

  return reply.status(200).send({
    success: true,
    message: "Test sonuçları kaydedildi.",
    data: savedScore,
  });
};