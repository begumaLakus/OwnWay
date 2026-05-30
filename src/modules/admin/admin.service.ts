import * as repo from "./admin.repository";

// ─── KULLANICILAR ──────────────────────────────────────────

export const getAllUsersService = async () => repo.getAllUsers();

export const deleteUserByAdmin = async (userId: number) =>
  repo.deleteUserById(userId);

export const updateUserRoleService = async (userId: number, role: string) => {
  if (!["STUDENT", "ADMIN"].includes(role.toUpperCase()))
    throw new Error("Geçersiz rol. Yalnızca STUDENT veya ADMIN kabul edilir.");
  return repo.updateUserRole(userId, role.toUpperCase());
};

// ─── DASHBOARD ─────────────────────────────────────────────

export const getDashboardStatsService = async () => repo.getDashboardStats();

// ─── ŞEHİRLER ─────────────────────────────────────────────

export const getAllCitiesService = async () => repo.getAllCities();

export const createCityService = async (data: any) => {
  if (!data.city_name?.trim()) throw new Error("Şehir adı zorunludur.");
  return repo.createCity({
    city_name: data.city_name.trim(),
    culture_score: parseFloat(data.culture_score) || 0,
    nature_score: parseFloat(data.nature_score) || 0,
    social_score: parseFloat(data.social_score) || 0,
    modern_score: parseFloat(data.modern_score) || 0,
    total_cost_index: parseFloat(data.total_cost_index) || 0,
  });
};

export const updateCityService = async (cityId: number, data: any) =>
  repo.updateCity(cityId, {
    city_name: data.city_name?.trim(),
    culture_score: data.culture_score !== undefined ? parseFloat(data.culture_score) : undefined,
    nature_score: data.nature_score !== undefined ? parseFloat(data.nature_score) : undefined,
    social_score: data.social_score !== undefined ? parseFloat(data.social_score) : undefined,
    modern_score: data.modern_score !== undefined ? parseFloat(data.modern_score) : undefined,
    total_cost_index: data.total_cost_index !== undefined ? parseFloat(data.total_cost_index) : undefined,
  });

export const deleteCityService = async (cityId: number) =>
  repo.deleteCityById(cityId);

// ─── ÜNİVERSİTELER ────────────────────────────────────────

export const createUniversityService = async (data: any) => {
  if (!data.uni_name?.trim()) throw new Error("Üniversite adı zorunludur.");
  if (!data.city_id) throw new Error("Şehir seçimi zorunludur.");
  return repo.createUniversity({
    city_id: parseInt(data.city_id),
    uni_name: data.uni_name.trim(),
    uni_type: data.uni_type || "Devlet",
    has_campus: data.has_campus ?? true,
    campus_count: parseInt(data.campus_count) || 1,
  });
};

export const updateUniversityService = async (uniId: number, data: any) =>
  repo.updateUniversity(uniId, {
    city_id: data.city_id ? parseInt(data.city_id) : undefined,
    uni_name: data.uni_name?.trim(),
    uni_type: data.uni_type,
    has_campus: data.has_campus,
    campus_count: data.campus_count !== undefined ? parseInt(data.campus_count) : undefined,
  });

export const deleteUniversityService = async (uniId: number) =>
  repo.deleteUniversityById(uniId);

// ─── BÖLÜMLER ─────────────────────────────────────────────

export const createDepartmentService = async (data: any) => {
  if (!data.dept_name?.trim()) throw new Error("Bölüm adı zorunludur.");
  if (!data.uni_id) throw new Error("Üniversite seçimi zorunludur.");
  return repo.createDepartment({
    uni_id: parseInt(data.uni_id),
    dept_name: data.dept_name.trim(),
    language: data.language || "Türkçe",
    quota: parseInt(data.quota) || 0,
    base_score: parseFloat(data.base_score) || 0,
    base_rank: parseInt(data.base_rank) || 0,
  });
};

export const updateDepartmentService = async (deptId: number, data: any) =>
  repo.updateDepartment(deptId, {
    uni_id: data.uni_id ? parseInt(data.uni_id) : undefined,
    dept_name: data.dept_name?.trim(),
    language: data.language,
    quota: data.quota !== undefined ? parseInt(data.quota) : undefined,
    base_score: data.base_score !== undefined ? parseFloat(data.base_score) : undefined,
    base_rank: data.base_rank !== undefined ? parseInt(data.base_rank) : undefined,
  });

export const deleteDepartmentService = async (deptId: number) =>
  repo.deleteDepartmentById(deptId);