import { apiClient } from './apiClient';

export interface RemedialClass {
  _id: string;
  subjectId: { _id: string, name: string, code: string };
  coordinatorId: { _id: string, name: string };
  schedule?: string;
  status?: string;
}

export interface GuestLecture {
  _id: string;
  title: string;
  speakerName: string;
  date: string;
  venue?: string;
}

export const supportService = {
  async getMyRemedialClasses(): Promise<RemedialClass[]> {
    const response = await apiClient.get('/academic-support/remedial-classes/student');
    return response.data;
  },

  async getMyGuestLectures(): Promise<GuestLecture[]> {
    const response = await apiClient.get('/academic-support/guest-lectures/student');
    return response.data;
  }
};
