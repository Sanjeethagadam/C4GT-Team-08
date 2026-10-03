import { apiClient } from "./apiClient";

export const importService = {
  async previewResults(file, type = "pdf", academicSemesterId) {
    console.log(type); // just to use the variable
    const formData = new FormData();
    formData.append("file", file);
    formData.append("academicSemesterId", academicSemesterId);
    const endpoint = "/results-backlogs/semester-results/upload-preview";

    const response = await apiClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async confirmImport(data) {
    const response = await apiClient.post(
      "/results-backlogs/semester-results/confirm-import",
      data,
    );
    return response.data;
  },
};
