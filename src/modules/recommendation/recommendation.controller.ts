/**
 * @file RecommendationController.ts
 * @description Controller handling HTTP requests for recommendation services.
 * Implements input validation, error handling, and standardized API responses.
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import { RecommendationService } from './recommendation.service';

const recommendationService = new RecommendationService();

export class RecommendationController {
  /**
   * Fetches personalized recommendations based on the authenticated user's profile.
   * Route: GET /api/recommendation/me
   */
  public async getMySuggestions(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Melike'nin Auth Middleware'inden gelen user bilgisini güvenli bir şekilde alıyoruz
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.code(401).send({
          success: false,
          message: "Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın."
        });
      }

      const results = await recommendationService.getPersonalizedSuggestions(userId);

      // Başarılı yanıt formatı (Standardized Response)
      return reply.code(200).send({
        success: true,
        count: results.length,
        data: results
      });

    } catch (error: any) {
      // Hata yönetimi: Servis katmanından gelen spesifik mesajları kullanıcıya ilet, 
      // diğerlerini genel bir hata mesajına çevir.
      const statusCode = error.statusCode || 500;

      return reply.code(statusCode).send({
        success: false,
        message: error.message || "Öneriler getirilirken sunucu taraflı bir hata oluştu."
      });
    }
  }

  /**
   * Handles department-based search requests.
   * Route: GET /api/recommendation/search?q=...
   */
  public async searchByDepartment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any)?.id;
      const { q } = request.query as { q: string };

      // Input Validation: Arama terimi boş olamaz
      if (!q || q.trim().length === 0) {
        return reply.code(400).send({
          success: false,
          message: "Lütfen geçerli bir arama terimi giriniz."
        });
      }

      const searchResults = await recommendationService.searchSuggestions(userId, q);

      return reply.code(200).send({
        success: true,
        count: searchResults.length,
        data: searchResults
      });

    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: "Arama işlemi sırasında teknik bir sorun oluştu."
      });
    }
  }
}