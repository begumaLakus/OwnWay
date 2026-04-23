import { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./user.service";

// 🔹 PROFİL GÜNCELLEME HANDLER
export const updateProfileHandler = async (request: any, reply: FastifyReply) => {
  // 🔥 KRİTİK DÜZELTME: 
  // Auth middleware'den gelen ID'nin adı artık 'id', 'user_id' değil!
  const userId = request.user.id; 
  const profileData = request.body;

  const updatedProfile = await service.updateProfileService(userId, profileData);

  return reply.status(200).send({
    success: true,
    message: "Profil başarıyla güncellendi.",
    data: updatedProfile,
  });
};

// 🔹 TEST SONUÇLARINI KAYDETME HANDLER
export const saveTestScoreHandler = async (request: any, reply: FastifyReply) => {
  // 🔥 KRİTİK DÜZELTME: Aynı şekilde burayı da 'id' yapıyoruz.
  const userId = request.user.id;
  const scores = request.body;

  const savedScore = await service.saveTestScoreService(userId, scores);

  return reply.status(200).send({
    success: true,
    message: "Test sonuçları kaydedildi.",
    data: savedScore,
  });
};