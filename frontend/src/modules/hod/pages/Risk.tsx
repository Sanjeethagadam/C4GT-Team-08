import { useEffect, useState } from 'react';
import { PageHeader, StatCard, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { HODFilterBar } from '../components/HODFilterBar';
import { analyticsService, type AnalyticsFilters } from '@/services/analyticsService';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, ShieldCheck, AlertCircle, AlertOctagon, Percent } from 'lucide-react';

const RISK_COLORS = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

export const Risk = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [riskData, setRiskData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (currentFilters: AnalyticsFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getRiskDistribution(currentFilters);
      setRiskData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load risk distribution');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadData(filters);
    }
  }, [filters]);

  const lowCount = riskData.find(r => r.level === 'LOW')?.count || 0;
  const mediumCount = riskData.find(r => r.level === 'MEDIUM')?.count || 0;
  const highCount = riskData.find(r => r.level === 'HIGH')?.count || 0;
  const totalStudents = lowCount + mediumCount + highCount;
  const atRiskCount = mediumCount + highCount;
  const atRiskPercentage = totalStudents > 0 ? ((atRiskCount / totalStudents) * 100).toFixed(1) : 0;

  return (
    <>
      <PageHeader 
        title="Student Risk Profiles" 
        description="Monitor the academic risk levels based on active backlogs."
      />
      
      <HODFilterBar onFilterChange={setFilters} />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(filters)} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <StatCard title="Total Students" value={totalStudents} icon={Users} />
            <StatCard title="Low Risk" value={lowCount} icon={ShieldCheck} contextType="success" />
            <StatCard title="Medium Risk" value={mediumCount} icon={AlertCircle} contextType="warning" />
            <StatCard title="High Risk" value={highCount} icon={AlertOctagon} contextType="danger" />
            <StatCard title="At-Risk %" value={`${atRiskPercentage}%`} icon={Percent} contextType={atRiskCount > 0 ? "danger" : "success"} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Risk Distribution" description="Active backlogs: Low (0-1), Medium (2-4), High (5+)">
              {totalStudents === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500">No students available for this selection.</div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="level"
                      label
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.level as keyof typeof RISK_COLORS] || '#8884d8'} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
};
