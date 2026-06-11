import { FastifyInstance } from "fastify";
import { submitCareerTestHandler } from "./career.controller";
import { submitCareerTestSchema } from "./career.schema";

export const careerRoutes = async (fastify: FastifyInstance) => {
  fastify.post(
    "/submit-test",
    {
      schema: submitCareerTestSchema,
      preHandler: [(fastify as any).authenticate],
    },
    submitCareerTestHandler
  );
};