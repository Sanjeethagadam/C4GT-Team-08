import api from "./client";

export const getSubjects = async (params = {}) => {
  const response = await api.get("/subjects", { params });
  return response.data;
};
