import { apiClient } from "./apiClient";

export const ctpoService = {
  getDashboardMetrics: async () => {
    const response = await apiClient.get("/ctpo/dashboard");
    return response.data;
  },

  getStudentsList: async (params) => {
    const response = await apiClient.get("/ctpo/students", { params });
    return response.data;
  },

  getStudentProfile: async (id) => {
    const response = await apiClient.get(`/ctpo/students/${id}`);
    return response.data;
  },

  getMarksDataset: async (examType) => {
    const response = await apiClient.get("/ctpo/marks-dataset", {
      params: { examType },
    });
    return response.data;
  },

  saveMarks: async (payload) => {
    const response = await apiClient.post("/ctpo/marks", payload);
    return response.data;
  },

  getResults: async (semesterCode) => {
    const params = semesterCode ? { semesterCode } : {};
    const response = await apiClient.get("/ctpo/results", { params });
    // Handle both old and new backend formats gracefully
    if (response.data && Array.isArray(response.data)) {
      return { results: response.data, year: "1" };
    }
    return response.data;
  },

  getPerformance: async () => {
    const response = await apiClient.get("/ctpo/performance");
    return response.data;
  },

  uploadNotice: async (formData) => {
    const response = await apiClient.post("/notifications/notices", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getNotices: async () => {
    const response = await apiClient.get("/notifications/notices");
    return response.data;
  },

  publishNotice: async (id) => {
    const response = await apiClient.put(
      `/notifications/notices/${id}/publish`,
    );
    return response.data;
  },

  estimateNotice: async (id) => {
    const response = await apiClient.put(
      `/notifications/notices/${id}/publish?estimate=true`,
    );
    return response.data;
  },

  unpublishNotice: async (id) => {
    const response = await apiClient.put(
      `/notifications/notices/${id}/unpublish`,
    );
    return response.data;
  },

  deleteNotice: async (id) => {
    const response = await apiClient.delete(`/notifications/notices/${id}`);
    return response.data;
  },

  getNoticeStats: async (id) => {
    const response = await apiClient.get(`/notifications/notices/${id}/stats`);
    return response.data;
  },

  exportData: async (endpoint, format, exportParams = {}) => {
    const queryParams = new URLSearchParams(exportParams);
    queryParams.set("format", format);

    if (format === "excel") {
      const response = await apiClient.get(
        `/ctpo/exports/${endpoint}?${queryParams.toString()}`,
        { responseType: "blob" },
      );
      // When responseType is 'blob', Axios interceptor returns the Blob directly as response.data,
      // so 'response' here IS the Blob object.
      return response;
    } else {
      const response = await apiClient.get(
        `/ctpo/exports/${endpoint}?${queryParams.toString()}`,
      );
      // For JSON, 'response' contains the inner data object because of interceptor.
      return response;
    }
  },
};
