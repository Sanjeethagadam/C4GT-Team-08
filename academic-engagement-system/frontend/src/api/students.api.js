import api from "./client";

export const getStudents = async (params = {}) => {
  const response = await api.get("/students", { params });
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/students/profile/me");
  return response.data;
};
