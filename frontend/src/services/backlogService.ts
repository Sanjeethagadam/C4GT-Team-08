import { apiClient } from './apiClient';

export interface BacklogStudent {
  student: {
    _id: string;
    rollNo: string;
    name: string;
    branch: any;
    year: number;
    section: any;
  };
  activeBacklogCount: number;
  backlogs: any[];
}

export const backlogService = {
  async getBacklogStudents(filters?: any): Promise<{ data: BacklogStudent[], pagination: { total: number, page: number, limit: number } }> {
    const response = await apiClient.get('/results-backlogs/backlogs/students', { params: filters });
    return {
      data: response.data || [],
      pagination: (response as any).pagination || { total: 0, page: 1, limit: 50 }
    };
  }
};
