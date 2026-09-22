import { apiClient } from './apiClient';

export interface GuestLecture {
  _id: string;
  topic: string;
  subjectId?: string | any;
  customSubjectName?: string;
  speakerName: string;
  organization?: string;
  designation?: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  targetBranches?: any[];
  targetYear?: number;
  targetSemester?: number;
  targetSection?: any;
  eligibleStudentIds?: any[];
}

export const guestLectureService = {
  async getTargetStudents(params: { targetBranches?: string, targetYear?: number, targetSemester?: number, targetSection?: string, subjectId?: string }): Promise<any[]> {
    const response = await apiClient.get('/academic-support/guest-lectures/target-students', { params });
    return response.data;
  },

  async getAllGuestLectures(filters?: any): Promise<GuestLecture[]> {
    const response = await apiClient.get('/academic-support/guest-lectures', { params: filters });
    return response.data;
  },
  
  async createGuestLecture(data: Partial<GuestLecture>): Promise<GuestLecture> {
    const response = await apiClient.post('/academic-support/guest-lectures', data);
    return response.data;
  },
  
  async updateGuestLecture(id: string, data: Partial<GuestLecture>): Promise<GuestLecture> {
    const response = await apiClient.put(`/academic-support/guest-lectures/${id}`, data);
    return response.data;
  },
  
  async deleteGuestLecture(id: string): Promise<any> {
    const response = await apiClient.delete(`/academic-support/guest-lectures/${id}`);
    return response.data;
  }
};
