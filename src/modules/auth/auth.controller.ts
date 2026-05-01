import { FastifyRequest, FastifyReply } from "fastify";
import { registerService, loginService } from "./auth.service";
import { registerSchema, loginSchema } from "./schemas/auth.schema";
import { getUserProfileService } from "../user/user.service";

// 🔹 REGISTER
export const registerController = async (request: FastifyRequest) => {
  const data = registerSchema.parse(request.body);
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
  const user = await loginService(data.email, data.password) as any;

  const token = reply.server.jwt.sign({
    id: user.id,
    email: user.email,
  });

  // Service artık profile'ı düz döndürüyor, user.profile değil direkt user.first_name
  return {
    success: true,
    message: "Login successful",
    data: {
      token,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email,
      id: user.id,
      current_location: user.current_location || "",
      high_school: user.high_school || "",
      dept_type: user.dept_type || "",
      personality_type: user.personality_type || "",
    },
  };
};

// 🔹 ME
export const meController = async (request: any) => {
  try {
    const userId = request.user.id;
    const fullUserData = await getUserProfileService(userId);
    return {
      success: true,
      message: "User profile data retrieved",
      data: fullUserData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Profil bilgileri alınamadı",
    };
  }
};