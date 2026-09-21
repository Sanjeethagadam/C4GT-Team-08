import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard, StatCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { Presentation, CheckCircle, TrendingUp } from 'lucide-react';

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

      const scheduledPct = total > 0 ? Math.round((scheduled / total) * 100) : 0;
      const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;

      setData({
        total,
        scheduled,
        completed,
        scheduledPct,
        completedPct
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
          {/* Stat cards wrapper */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="[&>div]:border-2 [&>div]:border-slate-300 [&>div]:rounded-2xl [&>div]:shadow-sm">
              <StatCard
                title="Total Lectures"
                value={data.total.toString()}
                icon={Presentation}
                contextLine="Institution Wide"
              />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-pink-400 [&>div]:rounded-2xl [&>div]:shadow-sm [&>div]:bg-pink-50/70">
              <StatCard
                title="Upcoming Lectures"
                value={data.scheduled.toString()}
                icon={Presentation}
                contextType="warning"
                contextLine="Scheduled"
              />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-emerald-400 [&>div]:rounded-2xl [&>div]:shadow-sm [&>div]:bg-emerald-50/70">
              <StatCard
                title="Completed Lectures"
                value={data.completed.toString()}
                icon={CheckCircle}
                contextType="success"
                contextLine="Finished"
              />
            </div>
          </div>

          {/* Clean Progress Breakdown View instead of Charts */}
          <ChartCard title="Guest Lecture Status" description="Distribution breakdown of guest lecture activity">
            {data.total === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-slate-500 text-lg font-medium">
                No guest lectures have been scheduled or recorded yet.
              </div>
            ) : (
              <div className="py-6 px-4 space-y-6 max-w-2xl mx-auto">
                {/* Upcoming Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-700 flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-pink-500 inline-block"></span>
                      Upcoming Lectures
                    </span>
                    <span className="text-slate-900 font-bold">{data.scheduled} <span className="text-slate-400 font-normal">({data.scheduledPct}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-rose-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${data.scheduledPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Completed Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-700 flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block"></span>
                      Completed Lectures
                    </span>
                    <span className="text-slate-900 font-bold">{data.completed} <span className="text-slate-400 font-normal">({data.completedPct}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${data.completedPct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-pink-500" /> Engagement tracking active</span>
                  <span>Total Recorded: {data.total}</span>
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      ) : null}
    </>
  );
};