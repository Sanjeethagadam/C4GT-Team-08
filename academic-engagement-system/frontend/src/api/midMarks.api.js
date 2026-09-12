import api from "./client";

export const enterMidMarks = async (data) => {
  const response = await api.post("/mid-marks", data);
  return response.data;
};

export const saveMidMarks = enterMidMarks;

export const updateMidMark = async (id, data) => {
  const response = await api.patch(`/mid-marks/${id}`, data);
  return response.data;
};

export const getBranchMidMarks = async (params = {}) => {
  const response = await api.get("/mid-marks/branch", { params });
  return response.data;
};

export const getStudentMidMarks = async (studentId) => {
  const response = await api.get(`/mid-marks/student/${studentId}`);
  return response.data;
};

export const getMidMarksByStudent = getStudentMidMarks;

export const getMyMidMarks = async () => {
  const response = await api.get("/mid-marks/my-marks");
  return response.data;
};
