import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Risk = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const risk = await analyticsService.getRiskDistribution();
      
      const lowRisk = risk.find((r: any) => r.level === 'LOW')?.count || 0;
      const mediumRisk = risk.find((r: any) => r.level === 'MEDIUM')?.count || 0;
      const highRisk = risk.find((r: any) => r.level === 'HIGH')?.count || 0;
      const atRisk = mediumRisk + highRisk;
      const totalStudents = lowRisk + mediumRisk + highRisk;

      const riskData = [
        { name: 'Low Risk', value: lowRisk, color: '#10b981' },
        { name: 'Medium Risk', value: mediumRisk, color: '#f59e0b' },
        { name: 'High Risk', value: highRisk, color: '#ef4444' }
      ];

      setData({
        riskData,
        lowRisk,
        mediumRisk,
        highRisk,
        atRisk,
        totalStudents
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load risk data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <PageHeader 
        title="Student Risk Analysis" 
        description="Institution-wide student risk analysis based on active backlogs."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <p className="text-sm font-medium text-slate-500 mb-1">Total Evaluated</p>
              <p className="text-3xl font-bold text-slate-800">{data.totalStudents}</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 shadow-sm text-center">
              <p className="text-sm font-medium text-emerald-600 mb-1">Low Risk (0-1 backlogs)</p>
              <p className="text-3xl font-bold text-emerald-700">{data.lowRisk}</p>
              <p className="text-xs text-emerald-600 mt-1">{data.totalStudents > 0 ? ((data.lowRisk / data.totalStudents) * 100).toFixed(1) : 0}%</p>
            </div>
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 shadow-sm text-center">
              <p className="text-sm font-medium text-amber-600 mb-1">Medium Risk (2-4 backlogs)</p>
              <p className="text-3xl font-bold text-amber-700">{data.mediumRisk}</p>
              <p className="text-xs text-amber-600 mt-1">{data.totalStudents > 0 ? ((data.mediumRisk / data.totalStudents) * 100).toFixed(1) : 0}%</p>
            </div>
            <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 shadow-sm text-center">
              <p className="text-sm font-medium text-rose-600 mb-1">High Risk (5+ backlogs)</p>
              <p className="text-3xl font-bold text-rose-700">{data.highRisk}</p>
              <p className="text-xs text-rose-600 mt-1">{data.totalStudents > 0 ? ((data.highRisk / data.totalStudents) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-orange-800">Total At-Risk Students</h3>
              <p className="text-sm text-orange-700 mt-1">Students with Medium or High Risk (2 or more active backlogs)</p>
            </div>
            <div className="text-4xl font-black text-orange-600">
              {data.atRisk}
            </div>
          </div>

          <ChartCard title="Risk Distribution" description="Proportional breakdown of student risk levels across the institution">
            {data.totalStudents === 0 ? (
              <div className="flex h-[350px] items-center justify-center text-slate-500 text-lg font-medium">
                No risk data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={data.riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.riskData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      ) : null}
    </>
  );
};
