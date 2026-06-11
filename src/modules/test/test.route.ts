import { FastifyInstance } from "fastify";
import { submitTestHandler, submitCareerHandler } from "./test.controller";

export default async function testRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/submit",
    {
      schema: {
        body: {
          type: 'object',
          required: ['culture_w', 'nature_w', 'social_w', 'modern_w'],
          properties: {
            culture_w: { type: 'number', minimum: 0, maximum: 100 },
            nature_w: { type: 'number', minimum: 0, maximum: 100 },
            social_w: { type: 'number', minimum: 0, maximum: 100 },
            modern_w: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
      },
      preHandler: [(fastify as any).authenticate],
    },
    submitTestHandler
  );

  fastify.post(
    "/submit-career",
    {
      schema: {
        body: {
          type: 'object',
          required: ['occupations'],
          properties: {
            occupations: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 10,
            },
          },
        },
      },
      preHandler: [(fastify as any).authenticate],
    },
    submitCareerHandler
  );
}