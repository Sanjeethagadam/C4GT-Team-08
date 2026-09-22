import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard, StatCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { Presentation, Users, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const GuestLectures = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await analyticsService.getGuestLectureStats();
      
      const scheduled = stats.find((s: any) => s._id === 'SCHEDULED')?.count || 0;
      const completed = stats.find((s: any) => s._id === 'COMPLETED')?.count || 0;
      const total = scheduled + completed;

      const lectureDist = [
        { name: 'Scheduled', value: scheduled },
        { name: 'Completed', value: completed }
      ];

      setData({
        total,
        scheduled,
        completed,
        lectureDist
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load guest lecture data');
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
        title="Guest Lectures" 
        description="Monitor guest lecture activity and engagement across the institution."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Lectures"
              value={data.total.toString()}
              icon={Presentation}
              contextLine="Institution Wide"
            />
            <StatCard
              title="Upcoming Lectures"
              value={data.scheduled.toString()}
              icon={Users}
              contextType="warning"
              contextLine="Scheduled"
            />
            <StatCard
              title="Completed Lectures"
              value={data.completed.toString()}
              icon={CheckCircle}
              contextType="success"
              contextLine="Finished"
            />
          </div>

          <ChartCard title="Guest Lecture Status" description="Distribution of guest lecture activity">
            {data.total === 0 ? (
              <div className="flex h-[350px] items-center justify-center text-slate-500 text-lg font-medium">
                No guest lectures have been scheduled or recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.lectureDist} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} name="Lectures" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      ) : null}
    </>
  );
};
