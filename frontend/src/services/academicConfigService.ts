import { apiClient } from './apiClient';

export interface AcademicYear {
  _id: string;
  academicYear: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

export interface Semester {
  _id: string;
  semesterCode: string;
  academicYearId?: AcademicYear | string;
  status: string;
}

const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';

export const academicConfigService = {
  async getAllAcademicYears(filters?: any): Promise<AcademicYear[]> {
    const response = await apiClient.get(`${getBase()}/academic-years`, { params: filters });
    return response.data;
  },
  
  async createAcademicYear(data: Partial<AcademicYear>): Promise<AcademicYear> {
    const response = await apiClient.post(`${getBase()}/academic-years`, data);
    return response.data;
  },

  async updateAcademicYear(id: string, data: Partial<AcademicYear>): Promise<AcademicYear> {
    const response = await apiClient.put(`${getBase()}/academic-years/${id}`, data);
    return response.data;
  },

  async getAllSemesters(filters?: any): Promise<Semester[]> {
    const response = await apiClient.get(`${getBase()}/semesters`, { params: filters });
    return response.data;
  },
  
  async createSemester(data: Partial<Semester>): Promise<Semester> {
    const response = await apiClient.post(`${getBase()}/semesters`, data);
    return response.data;
  },

  async updateSemester(id: string, data: Partial<Semester>): Promise<Semester> {
    const response = await apiClient.put(`${getBase()}/semesters/${id}`, data);
    return response.data;
  }
};
