import { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./user.service";

// Route dosyasındaki hatayı çözen fonksiyon budur
export const getUserProfileHandler = async (request: any, reply: FastifyReply) => {
  try {
    const userId = request.user.id;
    const user = await service.getUserProfileService(userId);
    return reply.status(200).send(user);
  } catch (error: any) {
    return reply.status(error.statusCode || 500).send({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateProfileHandler = async (request: any, reply: FastifyReply) => {
  try {
    const userId = request.user.id;
    const result = await service.updateProfileService(userId, request.body);
    return reply.status(200).send(result);
  } catch (error: any) {
    return reply.status(error.statusCode || 500).send({ success: false, message: error.message });
  }
};

export const saveTestScoreHandler = async (request: any, reply: FastifyReply) => {
  try {
    const userId = request.user.id;
    const result = await service.saveTestScoreService(userId, request.body);
    return reply.status(201).send(result);
  } catch (error: any) {
    return reply.status(error.statusCode || 500).send({ success: false, message: error.message });
  }
};