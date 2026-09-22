import { apiClient } from './apiClient';

export interface Mark {
  _id: string;
  studentId: string;
  subjectId: { _id: string, subjectName: string, subjectCode: string, type: string };
  examinationId: { _id: string, type: string, term: string, status: string, examType?: string };
  marksObtained?: number;
  marks?: number;
  maxMarks?: number;
  status?: string;
}

export interface Examination {
  _id: string;
  type: string;
  term: string;
  status: string;
}

export const examinationService = {
  async getMyMarks(): Promise<Mark[]> {
    const response = await apiClient.get('/examination/marks/student/me');
    return response.data;
  },

  async getAllMarks(filters?: any): Promise<Mark[]> {
    const response = await apiClient.get('/examination/marks', { params: filters });
    return response.data;
  },

  async getAllExaminations(): Promise<Examination[]> {
    const response = await apiClient.get('/examination/examinations');
    return response.data;
  },

  async createMark(data: { studentId: string, subjectId: string, examinationId: string, marks: number }): Promise<Mark> {
    const response = await apiClient.post('/examination/marks', data);
    return response.data;
  },

  async updateMark(id: string, data: { marks: number }): Promise<Mark> {
    const response = await apiClient.put(`/examination/marks/${id}`, data);
    return response.data;
  },

  async getCtpoAssignments(): Promise<any[]> {
    const response = await apiClient.get('/examination/ctpo-assignments');
    return response.data;
  },

  async getEvents(): Promise<any[]> {
    const response = await apiClient.get('/examination/events');
    return response.data;
  },

  async getMarksDataset(assignmentId: string, examinationId: string): Promise<any> {
    const response = await apiClient.get('/examination/marks/dataset', {
      params: { assignmentId, examinationId }
    });
    return response.data;
  },

  async bulkEnterMarks(payload: { assignmentId: string, examinationId: string, subjectId: string, marksData: any[], isSubmit: boolean }): Promise<any> {
    const response = await apiClient.post('/examination/marks/bulk', payload);
    return response.data;
  }
};
