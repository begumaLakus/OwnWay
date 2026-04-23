import * as adminRepo from "./admin.repository";

export const getAllUsersService = async () => {
  // Burada ileride veriyi filtreleyebilir veya düzenleyebilirsin
  return await adminRepo.getAllUsers();
};

export const deleteUserByAdmin = async (userId: number) => {
  // 🔥 KRİTİK DÜZELTME: 
  // Controller'dan gelen sayısal ID'yi repository'ye paslıyoruz.
  // Tipini 'number' yaptık çünkü şemada id: Int olarak tanımlı.
  return await adminRepo.deleteUserById(userId);
};