import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { apiClient } from '@/services/apiClient';

interface RiskData {
  name: string;
  value: number;
}

export const SystemConfiguration = () => {
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [riskByYearData, setRiskByYearData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const response = await apiClient.get('/analytics/admin-dashboard');
        const data = response.data;
        if (data && data.riskDistribution) {
          const low = data.riskDistribution.find((r: any) => r.level === 'LOW')?.count || 0;
          const medium = data.riskDistribution.find((r: any) => r.level === 'MEDIUM')?.count || 0;
          const high = data.riskDistribution.find((r: any) => r.level === 'HIGH')?.count || 0;
          
          const chartData = [
            { name: 'Low Risk', value: low },
            { name: 'Medium Risk', value: medium },
            { name: 'High Risk', value: high },
          ];
          setRiskData(chartData);
        }

        if (data && data.riskByYear) {
          const barData = data.riskByYear.map((item: any) => {
            const low = item.distribution?.find((r: any) => r.level === 'LOW')?.count || 0;
            const medium = item.distribution?.find((r: any) => r.level === 'MEDIUM')?.count || 0;
            const high = item.distribution?.find((r: any) => r.level === 'HIGH')?.count || 0;
            return {
              name: item.year,
              LOW: low,
              MEDIUM: medium,
              HIGH: high,
              total: low + medium + high
            };
          });
          setRiskByYearData(barData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load risk distribution');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRisk();
  }, []);

  const lowRisk = riskData.find(r => r.name === 'Low Risk')?.value || 0;
  const mediumRisk = riskData.find(r => r.name === 'Medium Risk')?.value || 0;
  const highRisk = riskData.find(r => r.name === 'High Risk')?.value || 0;
  const atRiskTotal = mediumRisk + highRisk;
  const totalRiskStudents = lowRisk + mediumRisk + highRisk;
  
  const getPercentage = (value: number) => {
    if (totalRiskStudents === 0) return '0.0%';
    return ((value / totalRiskStudents) * 100).toFixed(1) + '%';
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Configuration" 
        description="Institution-wide academic risk rules and real-time distribution."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rules Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              Active Backlog Risk Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">LOW RISK</h4>
                <p className="text-sm text-slate-600">0–1 active backlog</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">MEDIUM RISK</h4>
                <p className="text-sm text-slate-600">2–4 active backlogs</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-rose-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">HIGH RISK</h4>
                <p className="text-sm text-slate-600">5+ active backlogs</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800">AT-RISK DEFINITION</span>
                <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded shadow-sm border border-slate-200">
                  MEDIUM + HIGH
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Institution Risk Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <LoadingSkeleton type="table" />
            ) : error ? (
              <ErrorState message={error} onRetry={() => window.location.reload()} />
            ) : (
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-emerald-700 font-semibold text-sm">LOW</span>
                    <span className="text-emerald-600 font-medium text-xs bg-emerald-100 px-2 py-0.5 rounded">{getPercentage(lowRisk)}</span>
                  </div>
                  <span className="text-3xl font-bold text-emerald-900">{lowRisk.toLocaleString()}</span>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-700 font-semibold text-sm">MEDIUM</span>
                    <span className="text-amber-600 font-medium text-xs bg-amber-100 px-2 py-0.5 rounded">{getPercentage(mediumRisk)}</span>
                  </div>
                  <span className="text-3xl font-bold text-amber-900">{mediumRisk.toLocaleString()}</span>
                </div>
                <div className="bg-rose-50 rounded-lg p-4 border border-rose-100 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-rose-700 font-semibold text-sm">HIGH</span>
                    <span className="text-rose-600 font-medium text-xs bg-rose-100 px-2 py-0.5 rounded">{getPercentage(highRisk)}</span>
                  </div>
                  <span className="text-3xl font-bold text-rose-900">{highRisk.toLocaleString()}</span>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-indigo-700 font-semibold text-sm">AT-RISK</span>
                    <span className="text-indigo-600 font-medium text-xs bg-indigo-100 px-2 py-0.5 rounded">{getPercentage(atRiskTotal)}</span>
                  </div>
                  <span className="text-3xl font-bold text-indigo-900">{atRiskTotal.toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grouped Bar Chart Card */}
      <Card className="border-slate-200 shadow-sm mt-6">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Risk Distribution by Academic Year
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <LoadingSkeleton type="table" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : riskByYearData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskByYearData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="LOW" name="Low Risk" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="MEDIUM" name="Medium Risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="HIGH" name="High Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">No distribution data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
