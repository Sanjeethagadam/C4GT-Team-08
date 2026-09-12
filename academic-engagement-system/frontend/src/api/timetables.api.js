import api from "./client";

export const uploadTimetable = async (formData) => {
  const response = await api.post("/timetables/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getBranchTimetables = async (params = {}) => {
  const response = await api.get("/timetables/branch", { params });
  return response.data;
};

export const getMyTimetable = async () => {
  const response = await api.get("/timetables/my-timetable");
  return response.data;
};

export const getStudentTimetables = getMyTimetable;

export const getTimetableDownloadUrl = (id) => {
  const token = localStorage.getItem("token");
  return token ? `/api/timetables/${id}/download?token=${encodeURIComponent(token)}` : `/api/timetables/${id}/download`;
};

export const getTimetableFileUrl = (fileUrl, id) => {
  if (fileUrl && typeof fileUrl === 'string') {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    return fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  }
  if (id) {
    return getTimetableDownloadUrl(id);
  }
  return '#';
};


export const deleteTimetable = async (id) => {
  const response = await api.delete(`/timetables/${id}`);
  return response.data;
};
