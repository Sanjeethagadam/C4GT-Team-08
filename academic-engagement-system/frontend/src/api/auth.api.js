import api from "./client";

export const login = async (username, password) => {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/me");
  return response.data;
};
