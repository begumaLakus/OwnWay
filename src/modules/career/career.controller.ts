import { FastifyReply, FastifyRequest } from "fastify";
import { SubmitCareerTestInput } from "./career.schema";
import { processCareerTest } from "./career.service";

export const submitCareerTestHandler = async (
  request: FastifyRequest<{ Body: SubmitCareerTestInput }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any).id; 
    const result = await processCareerTest(userId, request.body);

    return reply.status(200).send({
      success: true,
      message: "Kariyer kişilik testiniz başarıyla işlendi!",
      data: result
    });
  } catch (error: any) {
    return reply.status(500).send({ 
      success: false, 
      error: error.message 
    });
  }
};