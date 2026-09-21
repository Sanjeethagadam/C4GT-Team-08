import { apiClient as api } from './apiClient';

export interface AttendanceRecord {
  studentId: {
    _id: string;
    rollNumber: string;
    firstName: string;
    lastName: string;
    branchId: { branchCode: string };
  };
  present: boolean;
}

export interface AttendanceSession {
  referenceId: string;
  referenceType: 'RemedialClass' | 'GuestLecture';
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  targetStudentCount: number;
  attendanceSubmitted: boolean;
  submittedAt?: string;
}

export const attendanceService = {
  getAttendance: async (referenceId: string) => {
    const res: any = await api.get(`/academic-support/attendance/${referenceId}`);
    return res.data;
  },

  submitAttendance: async (referenceId: string, referenceType: string, records: { studentId: string, present: boolean }[]) => {
    const res: any = await api.put(`/academic-support/attendance/${referenceId}`, { referenceType, records });
    return res;
  }
};
