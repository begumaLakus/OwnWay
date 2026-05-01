import { FastifyInstance } from "fastify";
import { submitTestHandler } from "./test.controller";

export default async function testRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/submit",
    {
      schema: {
        // Zod objesini doğrudan vermek yerine, Fastify'ın beklediği yapıyı kuruyoruz
        body: {
          type: 'object',
          required: ['culture_w', 'nature_w', 'social_w', 'modern_w'], // Hata veren "array" burasıydı, düzelttik
          properties: {
            culture_w: { type: 'number', minimum: 0, maximum: 100 },
            nature_w: { type: 'number', minimum: 0, maximum: 100 },
            social_w: { type: 'number', minimum: 0, maximum: 100 },
            modern_w: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
      },
      // Authenticate dekoratörü app.ts'de tanımlandığı için burada (fastify as any) ile erişebilirsin
      preHandler: [(fastify as any).authenticate], 
    },
    submitTestHandler
  );
}