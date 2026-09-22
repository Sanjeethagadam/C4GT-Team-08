import { apiClient } from './apiClient';

export interface RemedialClass {
  _id: string;
  subjectId?: string | any;
  customSubjectName?: string;
  facultyName: string;
  topic: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  targetYear?: number;
  targetSemester?: number;
  targetSection?: any;
  eligibleStudentIds?: any[];
}

export const remedialService = {
  async getEligibleStudents(params: { subjectId: string, targetYear?: number, targetSection?: string }): Promise<any[]> {
    const response = await apiClient.get('/academic-support/remedial-classes/eligible-students', { params });
    return response.data;
  },

  async getAllRemedialClasses(filters?: any): Promise<RemedialClass[]> {
    const response = await apiClient.get('/academic-support/remedial-classes', { params: filters });
    return response.data;
  },
  
  async createRemedialClass(data: Partial<RemedialClass>): Promise<RemedialClass> {
    const response = await apiClient.post('/academic-support/remedial-classes', data);
    return response.data;
  },
  
  async updateRemedialClass(id: string, data: Partial<RemedialClass>): Promise<RemedialClass> {
    const response = await apiClient.put(`/academic-support/remedial-classes/${id}`, data);
    return response.data;
  },
  
  async deleteRemedialClass(id: string): Promise<any> {
    const response = await apiClient.delete(`/academic-support/remedial-classes/${id}`);
    return response.data;
  }
};
