import { apiClient as api } from "./apiClient";

export const attendanceService = {
  getAttendance: async (referenceId) => {
    const res = await api.get(`/academic-support/attendance/${referenceId}`);
    return res.data;
  },

  submitAttendance: async (referenceId, referenceType, records) => {
    const res = await api.put(`/academic-support/attendance/${referenceId}`, {
      referenceType,
      records,
    });
    return res;
  },
};
