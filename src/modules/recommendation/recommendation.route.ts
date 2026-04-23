/**
 * @file recommendation.route.ts
 * @description Defines the API endpoints for the recommendation module.
 */

import { FastifyInstance } from 'fastify';
import { RecommendationController } from './recommendation.controller';
// Melike'nin yazdığı orijinal middleware'i import ediyoruz
import { authenticate } from '../auth/auth.middleware';

const controller = new RecommendationController();

export async function recommendationRoutes(server: FastifyInstance) {
  
  /**
   * @route GET /api/recommendation/me
   * Kişiselleştirilmiş önerileri getirir.
   */
  server.get('/me', {
    // Tip zorlaması yerine doğrudan orijinal authenticate fonksiyonunu kullanıyoruz
    preHandler: [authenticate] 
  }, (request, reply) => controller.getMySuggestions(request, reply));

  /**
   * @route GET /api/recommendation/search
   * Departman ismine göre arama yapar.
   */
  server.get('/search', {
    preHandler: [authenticate]
  }, (request, reply) => controller.searchByDepartment(request, reply));
}