import { FastifyRequest, FastifyReply } from "fastify";
import { registerService, loginService } from "./auth.service";
import { registerSchema, loginSchema } from "./schemas/auth.schema";

// 🔹 REGISTER
export const registerController = async (request: FastifyRequest) => {
  // Artık sadece email ve password değil, tüm body'yi parse ediyoruz (first_name vb. dahil)
  const data = registerSchema.parse(request.body);

  // registerService'e tüm data objesini gönderiyoruz ki profili de oluşturabilsin
  const user = await registerService(data);

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

  // 🔥 KRİTİK DÜZELTME: 
  // Yeni şemanda User tablosundaki anahtar 'id'. 'user_id' değil!
  const token = reply.server.jwt.sign({
    id: user.id, // user_id yazarsan token undefined olur ve Şeyma login olamaz.
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