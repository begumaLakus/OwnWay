import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError";

const users: any[] = [];

export const registerService = async (email: string, password: string) => {
  // email var mı kontrol et
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now(),
    email,
    password: hashed,
  };

  users.push(user);

  return { id: user.id, email: user.email };
};

export const loginService = async (email: string, password: string) => {
  const user = users.find((u) => u.email === email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new AppError("Invalid credentials", 401);
  }

  return user;
};