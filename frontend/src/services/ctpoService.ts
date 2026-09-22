import { apiClient } from './apiClient';

export interface DashboardMetrics {
  totalStudents: number;
  studentsWithActiveBacklogs: number;
  activeBacklogSubjects: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    atRisk: number;
  };
}

export interface CtpoStudent {
  _id: string;
  rollNo: string;
  name: string;
  branch: string;
  year: number;
  activeBacklogCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'AT-RISK';
}

export interface StudentProfile {
  student: {
    _id: string;
    rollNo: string;
    name: string;
    branch: any;
    year: number;
    currentSemester: string;
    riskLevel: string;
    activeBacklogsCount: number;
  };
  activeBacklogs: Array<{
    subjectName: string;
    subjectCode?: string;
    semester?: string;
  }>;
  marks: Array<{
    _id: string;
    subjectName?: string;
    examName?: string;
    examType?: string;
    marksObtained: number;
    maxMarks: number;
    status: string;
    draft: boolean;
  }>;
  semesterResults: Array<{
    _id: string;
    subjectName?: string;
    semester?: string;
    grade?: string;
    gradePoint?: number;
    credits?: number;
    result?: string;
    passed?: boolean;
    internalMarks?: string;
    externalMarks?: string;
    totalMarks?: string;
  }>;
  history: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
  }>;
}

export const ctpoService = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get('/ctpo/dashboard');
    return response.data;
  },

  getStudentsList: async (params?: { search?: string; risk?: string; backlog?: string }): Promise<CtpoStudent[]> => {
    const response = await apiClient.get('/ctpo/students', { params });
    return response.data;
  },

  getStudentProfile: async (id: string): Promise<StudentProfile> => {
    const response = await apiClient.get(`/ctpo/students/${id}`);
    return response.data;
  },

  getMarksDataset: async (examType: 'MID1' | 'MID2'): Promise<any> => {
    const response = await apiClient.get('/ctpo/marks-dataset', { params: { examType } });
    return response.data;
  },

  saveMarks: async (payload: { examinationId: string; marksData: any[]; isSubmit: boolean }): Promise<any> => {
    const response = await apiClient.post('/ctpo/marks', payload);
    return response.data;
  },

  getResults: async (semesterCode?: string): Promise<{ results: any[], year: string }> => {
    const params = semesterCode ? { semesterCode } : {};
    const response = await apiClient.get('/ctpo/results', { params });
    // Handle both old and new backend formats gracefully
    if (response.data && Array.isArray(response.data)) {
      return { results: response.data, year: '1' };
    }
    return response.data;
  },

  getPerformance: async (): Promise<any> => {
    const response = await apiClient.get('/ctpo/performance');
    return response.data;
  },

  uploadNotice: async (formData: FormData): Promise<any> => {
    const response = await apiClient.post('/notifications/notices', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getNotices: async (): Promise<any[]> => {
    const response = await apiClient.get('/notifications/notices');
    return response.data;
  },

  publishNotice: async (id: string): Promise<any> => {
    const response = await apiClient.put(`/notifications/notices/${id}/publish`);
    return response.data;
  },

  estimateNotice: async (id: string): Promise<any> => {
    const response = await apiClient.put(`/notifications/notices/${id}/publish?estimate=true`);
    return response.data;
  },

  unpublishNotice: async (id: string): Promise<any> => {
    const response = await apiClient.put(`/notifications/notices/${id}/unpublish`);
    return response.data;
  },

  deleteNotice: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/notifications/notices/${id}`);
    return response.data;
  },

  getNoticeStats: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/notifications/notices/${id}/stats`);
    return response.data;
  },

  exportData: async (endpoint: string, format: 'excel' | 'pdf'): Promise<any> => {
    if (format === 'excel') {
      const response = await apiClient.get(`/ctpo/exports/${endpoint}?format=excel`, { responseType: 'blob' });
      // When responseType is 'blob', Axios interceptor returns the Blob directly as response.data, 
      // so 'response' here IS the Blob object.
      return response; 
    } else {
      const response = await apiClient.get(`/ctpo/exports/${endpoint}?format=json`);
      // For JSON, 'response' contains the inner data object because of interceptor.
      return response; 
    }
  }
};
