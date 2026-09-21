import { apiClient } from './apiClient';

export interface ImportPreviewResponse {
  results: any[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
  fileId?: string;
  tempToken?: string;
}

export const importService = {
  async previewResults(file: File, type: 'pdf' | 'csv' = 'pdf', academicSemesterId: string): Promise<ImportPreviewResponse> {
    console.log(type); // just to use the variable
    const formData = new FormData();
    formData.append('file', file);
    formData.append('academicSemesterId', academicSemesterId);
    
    const endpoint = '/results-backlogs/semester-results/upload-preview';

    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async confirmImport(data: any): Promise<any> {
    const response = await apiClient.post('/results-backlogs/semester-results/confirm-import', data);
    return response.data;
  }
};
