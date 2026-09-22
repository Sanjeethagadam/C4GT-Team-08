import { apiClient } from './apiClient';

export interface AcademicYear {
  _id: string;
  academicYear: string;
  isActive: boolean;
}

export interface Branch {
  _id: string;
  name: string;
  campusId: string;
}

export const academicYearService = {
  async getAllAcademicYears(): Promise<AcademicYear[]> {
    const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/v1', '');
    const response = await apiClient.get(`${baseURL}/academic-years`);
    return response.data;
  }
};

export const branchService = {
  async getAllBranches(): Promise<Branch[]> {
    const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/v1', '');
    const response = await apiClient.get(`${baseURL}/branches`);
    return response.data;
  }
};
