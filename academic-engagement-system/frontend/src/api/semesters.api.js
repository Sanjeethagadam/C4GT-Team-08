import api from "./client";

export const getSemesters = async () => {
  const response = await api.get("/semesters");
  return response.data;
};
