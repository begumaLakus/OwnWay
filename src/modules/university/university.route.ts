import { FastifyInstance } from "fastify";
import { getDiscoveryHandler } from "./university.controller"; // Birazdan oluşturacağız

export default async function universityRoutes(app: FastifyInstance) {
  // Haritadan şehir ismine göre veri çekme yolu
  app.get("/discover/:cityName", getDiscoveryHandler);
}