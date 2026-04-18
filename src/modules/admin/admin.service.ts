import * as adminRepo from "./admin.repository";

export const getAllUsersService = async () => {
  // Burada ileride veriyi filtreleyebilir veya düzenleyebilirsin
  return await adminRepo.getAllUsers();
};

export const deleteUserByAdmin = async (userId: string) => {
  return await adminRepo.deleteUserById(userId);
};