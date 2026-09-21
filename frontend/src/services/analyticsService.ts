import { apiClient } from './apiClient';

export interface AnalyticsFilters {
  year?: number;
  academicYearId?: string; // Kept for backwards compatibility if any other components still pass it, though HOD now uses year
  branchId?: string;
  semesterCode?: string; // e.g. '1-1', '3-2'
  sectionId?: string;
}

export interface BranchCount {
  branchCode: string;
  branchName: string;
  count: number;
}

export interface CampusKPIs {
  totalStudents: number;
  activeBacklogSubjects: number;
  studentsWithActiveBacklogs: number;
  studentBranches: BranchCount[];
  backlogBranches: BranchCount[];
  totalBacklogs?: number;
}

export const analyticsService = {
  async getAcademicTrends(filters?: AnalyticsFilters) {
    const response = await apiClient.get('/analytics/academic', { params: filters });
    return response.data;
  },

  async getResultsDistribution(filters?: AnalyticsFilters) {
    const response = await apiClient.get('/analytics/results', { params: filters });
    return response.data;
  },

  async getBacklogsDistribution(filters?: AnalyticsFilters) {
    const response = await apiClient.get('/analytics/backlogs', { params: filters });
    return response.data;
  },

  async getRiskDistribution(filters?: AnalyticsFilters) {
    const response = await apiClient.get('/analytics/risk', { params: filters });
    return response.data;
  },

  async getRemedialStats(filters?: AnalyticsFilters) {
    const response = await apiClient.get('/analytics/remedial', { params: filters });
    return response.data;
  },

  async getGuestLectureStats(filters?: AnalyticsFilters) {
    const response = await apiClient.get('/analytics/guest-lectures', { params: filters });
    return response.data;
  },

  async getCampusKPIs(filters?: AnalyticsFilters): Promise<CampusKPIs> {
    const response = await apiClient.get('/analytics/campus', { params: filters });
    return response.data;
  },

  async getStudentPersonalAnalytics() {
    const response = await apiClient.get('/analytics/student/me');
    return response.data;
  },

  async getAdminDashboard() {
    const response = await apiClient.get('/analytics/admin-dashboard');
    return response.data;
  }
};
