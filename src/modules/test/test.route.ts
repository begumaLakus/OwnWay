import { FastifyInstance } from "fastify";
import { submitTestHandler } from "./test.controller";
import { SubmitTestSchema } from "./test.schema";

export default async function testRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/submit",
    {
      schema: {
        body: SubmitTestSchema,
      },
      // Hata devam ederse (fastify as any).authenticate kullanabilirsin
      // Ama en doğrusu Melike'nin auth fonksiyonunu nasıl export ettiğine bakmaktır.
      preHandler: [(fastify as any).authenticate], 
    },
    submitTestHandler
  );
}