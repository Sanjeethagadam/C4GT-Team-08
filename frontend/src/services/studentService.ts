import { apiClient } from './apiClient';
import type { Campus } from './campusService';
import type { Branch } from './branchService';
import type { Semester } from './academicConfigService';
import type { Section } from './sectionService';

export interface Student {
  _id: string;
  rollNo: string;
  name: string;
  campusId: Campus | string;
  branchId: Branch | string;
  year: number;
  semesterId: Semester | string;
  sectionId: Section | string;
  currentSemester?: Semester;
  section?: string;
  userId?: string;
  residence?: 'DAY_SCHOLAR' | 'HOSTELER' | 'UNASSIGNED';
}

export type StudentProfile = Student;

const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';

export const studentService = {
  async getAllStudents(filters?: any): Promise<Student[]> {
    const response = await apiClient.get(`${getBase()}/students`, { params: filters });
    return response.data;
  },

  async getProfile(): Promise<StudentProfile> {
    const response = await apiClient.get(`${getBase()}/students/me`);
    return response.data;
  },
  
  async createStudent(data: Partial<Student>): Promise<Student> {
    const response = await apiClient.post(`${getBase()}/students`, data);
    return response.data;
  },
  
  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    const response = await apiClient.put(`${getBase()}/students/${id}`, data);
    return response.data;
  },
  
  async deleteStudent(id: string): Promise<void> {
    await apiClient.delete(`${getBase()}/students/${id}`);
  }
};
