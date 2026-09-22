import { apiClient } from './apiClient';

export interface Result {
  _id: string;
  studentId: string;
  subjectId: { _id: string, subjectName: string, subjectCode: string };
  semesterId: { _id: string, semesterCode: string, year: number };
  resultStatus: 'PASS' | 'FAIL' | 'ABSENT';
  grade?: string;
  gradePoint?: number;
  credits?: number;
  isOfficial?: boolean;
  isHistorical?: boolean;
  source: string;
}

export interface Backlog {
  _id: string;
  studentId: string;
  subjectId: { _id: string, subjectName: string, subjectCode: string, credits?: number };
  status: 'ACTIVE' | 'CLEARED';
}

export interface RiskProfile {
  _id: string;
  studentId: { _id: string, name: string, rollNo: string };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
  status: string;
}

export const resultService = {
  async getMyResults(): Promise<Result[]> {
    const response = await apiClient.get('/results-backlogs/semester-results');
    return response.data;
  },
  
  async getMyBacklogs(): Promise<Backlog[]> {
    const response = await apiClient.get('/results-backlogs/backlogs');
    return response.data;
  },

  async getAllResults(filters?: any): Promise<Result[]> {
    const response = await apiClient.get('/results-backlogs/semester-results', { params: filters });
    return response.data;
  },

  async getAllBacklogs(filters?: any): Promise<Backlog[]> {
    const response = await apiClient.get('/results-backlogs/backlogs', { params: filters });
    return response.data;
  },

  async getAllRiskProfiles(filters?: any): Promise<RiskProfile[]> {
    const response = await apiClient.get('/results-backlogs/risk', { params: filters });
    return response.data?.data || response.data;
  }
};
