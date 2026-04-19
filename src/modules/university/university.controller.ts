import { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./university.service";

export const getDiscoveryHandler = async (
  request: FastifyRequest<{ Params: { cityName: string } }>,
  reply: FastifyReply
) => {
  const { cityName } = request.params;

  // Servis katmanına gidip veriyi istiyoruz
  const data = await service.getCityDiscoveryService(cityName);

  return reply.status(200).send({
    success: true,
    message: `${cityName} şehri verileri başarıyla getirildi.`,
    data,
  });
};