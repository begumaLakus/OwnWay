import { FastifyRequest, FastifyReply } from "fastify";
import { registerService, loginService } from "./auth.service";
import { registerSchema, loginSchema } from "./schemas/auth.schema";

// 🔹 REGISTER
export const registerController = async (request: FastifyRequest) => {
  const data = registerSchema.parse(request.body);

  const user = await registerService(data.email, data.password);

  return {
    success: true,
    message: "User registered successfully",
    data: user,
  };
};

// 🔹 LOGIN
export const loginController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const data = loginSchema.parse(request.body);

  const user = await loginService(data.email, data.password);

  const token = reply.server.jwt.sign({
    id: user.user_id, // 🔥 DÜZELTİLDİ
    email: user.email,
  });

  return {
    success: true,
    message: "Login successful",
    data: { token },
  };
};

// 🔹 ME (protected route)
export const meController = async (request: any) => {
  return {
    success: true,
    message: "User data",
    data: request.user,
  };
};