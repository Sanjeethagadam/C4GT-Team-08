import { apiClient } from './apiClient';

export interface RiskThreshold {
  _id: string;
  type: string;
  thresholdValue: number;
  description: string;
  isActive: boolean;
}

export const systemConfigService = {
  async getAllRiskThresholds(filters?: any): Promise<RiskThreshold[]> {
    const response = await apiClient.get('/results-backlogs/risk/config', { params: filters });
    return response.data;
  },
  
  async updateRiskThreshold(_id: string, data: Partial<RiskThreshold>): Promise<RiskThreshold> {
    // Note: The backend uses POST for /config rather than PUT /config/:id based on risk.routes.js
    const response = await apiClient.post('/results-backlogs/risk/config', data);
    return response.data;
  }
};
