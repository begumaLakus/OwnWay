import { prisma } from "../../config/prisma";

// ─── KULLANICILAR ──────────────────────────────────────────

// @ts-ignore
export const getAllUsers = async () =>
  prisma.user.findMany({ include: { profile: true }, orderBy: { id: "asc" } });

// @ts-ignore
export const deleteUserById = async (userId: number) =>
  prisma.user.delete({ where: { id: userId } });

// @ts-ignore
export const updateUserRole = async (userId: number, role: string) =>
  prisma.user.update({ where: { id: userId }, data: { role } });

// ─── DASHBOARD ─────────────────────────────────────────────

export const getDashboardStats = async () => {
  // @ts-ignore
  const [totalUsers, totalCities, totalUniversities, totalDepartments] =
    await Promise.all([
      // @ts-ignore
      prisma.user.count(),
      // @ts-ignore
      prisma.city.count(),
      // @ts-ignore
      prisma.university.count(),
      // @ts-ignore
      prisma.department.count(),
    ]);
  return { totalUsers, totalCities, totalUniversities, totalDepartments };
};

// ─── ŞEHİRLER ─────────────────────────────────────────────

// @ts-ignore
export const getAllCities = async () =>
  prisma.city.findMany({
    include: { universities: { include: { departments: true } } },
    orderBy: { city_name: "asc" },
  });

export const createCity = async (data: {
  city_name: string;
  culture_score: number;
  nature_score: number;
  social_score: number;
  modern_score: number;
  total_cost_index: number;
}) =>
  // @ts-ignore
  prisma.city.create({ data });

export const updateCity = async (
  cityId: number,
  data: {
    city_name?: string;
    culture_score?: number;
    nature_score?: number;
    social_score?: number;
    modern_score?: number;
    total_cost_index?: number;
  }
) =>
  // @ts-ignore
  prisma.city.update({ where: { id: cityId }, data });

// @ts-ignore
export const deleteCityById = async (cityId: number) =>
  prisma.city.delete({ where: { id: cityId } });

// ─── ÜNİVERSİTELER ────────────────────────────────────────

export const createUniversity = async (data: {
  city_id: number;
  uni_name: string;
  uni_type: string;
  has_campus: boolean;
  campus_count: number;
}) =>
  // @ts-ignore
  prisma.university.create({ data });

export const updateUniversity = async (
  uniId: number,
  data: {
    city_id?: number;
    uni_name?: string;
    uni_type?: string;
    has_campus?: boolean;
    campus_count?: number;
  }
) =>
  // @ts-ignore
  prisma.university.update({ where: { id: uniId }, data });

// @ts-ignore
export const deleteUniversityById = async (uniId: number) =>
  prisma.university.delete({ where: { id: uniId } });

// ─── BÖLÜMLER ─────────────────────────────────────────────

export const createDepartment = async (data: {
  uni_id: number;
  dept_name: string;
  language: string;
  quota: number;
  base_score: number;
  base_rank: number;
  female_student_count?: number;
  male_student_count?: number;
}) =>
  // @ts-ignore
  prisma.department.create({ data });

export const updateDepartment = async (
  deptId: number,
  data: {
    uni_id?: number;
    dept_name?: string;
    language?: string;
    quota?: number;
    base_score?: number;
    base_rank?: number;
    female_student_count?: number;
    male_student_count?: number;
  }
) =>
  // @ts-ignore
  prisma.department.update({ where: { id: deptId }, data });

// @ts-ignore
export const deleteDepartmentById = async (deptId: number) =>
  prisma.department.delete({ where: { id: deptId } });