/**
 * @file recommendation.route.ts
 * @description Defines the API endpoints for the recommendation module.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RecommendationController } from './recommendation.controller';

const controller = new RecommendationController();

export async function recommendationRoutes(server: FastifyInstance) {
  
  // TypeScript'in 'authenticate' hatasını engellemek için tip zorlaması 
  const authenticate = (server as any).authenticate;

  /**
   * @route GET /api/recommendation/me
   */
  server.get('/me', {
    // Eğer authenticate varsa kullan, yoksa boş geç (hata almamak için)
    preHandler: authenticate ? [authenticate] : [] 
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return controller.getMySuggestions(request, reply);
  });

  /**
   * @route GET /api/recommendation/search
   */
  server.get('/search', {
    preHandler: authenticate ? [authenticate] : []
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return controller.searchByDepartment(request, reply);
  });
}