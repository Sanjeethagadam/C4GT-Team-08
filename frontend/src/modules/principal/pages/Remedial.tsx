import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard, StatCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { Calendar as CalendarIcon, Users, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Remedial = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await analyticsService.getRemedialStats();
      
      const scheduled = stats.find((s: any) => s._id === 'SCHEDULED')?.count || 0;
      const completed = stats.find((s: any) => s._id === 'COMPLETED')?.count || 0;
      const total = scheduled + completed;

      const remedialDist = [
        { name: 'Scheduled', value: scheduled },
        { name: 'Completed', value: completed }
      ];

      setData({
        total,
        scheduled,
        completed,
        remedialDist
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load remedial data');
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
        title="Remedial Activity" 
        description="Monitor remedial class sessions and attendance across the institution."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Sessions"
              value={data.total.toString()}
              icon={Users}
              contextLine="Institution Wide"
            />
            <StatCard
              title="Scheduled Sessions"
              value={data.scheduled.toString()}
              icon={CalendarIcon}
              contextType="warning"
              contextLine="Upcoming"
            />
            <StatCard
              title="Completed Sessions"
              value={data.completed.toString()}
              icon={CheckCircle}
              contextType="success"
              contextLine="Finished"
            />
          </div>

          <ChartCard title="Remedial Session Status" description="Distribution of current remedial sessions">
            {data.total === 0 ? (
              <div className="flex h-[350px] items-center justify-center text-slate-500 text-lg font-medium">
                No remedial sessions have been scheduled or recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.remedialDist} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      ) : null}
    </>
  );
};
