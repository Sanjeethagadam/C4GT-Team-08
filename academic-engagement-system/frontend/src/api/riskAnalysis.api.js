import api from "./client";

export const getRiskAnalysis = async (params = {}) => {
  const response = await api.get("/risk-analysis", { params });
  return response.data;
};
