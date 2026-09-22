import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { HODFilterBar } from '../components/HODFilterBar';
import { analyticsService, type AnalyticsFilters } from '@/services/analyticsService';
import { Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export const Remedial = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  
  const [remedialStats, setRemedialStats] = useState<any[]>([]);
  const [guestLectureStats, setGuestLectureStats] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (currentFilters: AnalyticsFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const [remedialData, guestData] = await Promise.all([
        analyticsService.getRemedialStats(currentFilters),
        analyticsService.getGuestLectureStats(currentFilters)
      ]);
      setRemedialStats(remedialData || []);
      setGuestLectureStats(guestData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load remedial stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadData(filters);
    }
  }, [filters]);

  const COLORS = {
    'SCHEDULED': '#3b82f6',
    'COMPLETED': '#10b981',
    'CANCELLED': '#ef4444'
  };

  return (
    <>
      <PageHeader 
        title="Academic Support & Remedial Progress" 
        description="Monitor remedial classes and guest lectures arranged for at-risk students."
      />
      
      <HODFilterBar onFilterChange={setFilters} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(filters)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Remedial Classes Progress" description="Status distribution of remedial sessions">
            {remedialStats.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500">No remedial sessions scheduled yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={remedialStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                    label
                  >
                    {remedialStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry._id as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          
          <ChartCard title="Guest Lectures Overview" description="Status distribution of guest lectures">
            {guestLectureStats.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500">No guest lectures scheduled yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                 <PieChart>
                  <Pie
                    data={guestLectureStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                    label
                  >
                    {guestLectureStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry._id as keyof typeof COLORS] || '#8b5cf6'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </>
  );
};
