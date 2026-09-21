import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard, StatCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { Calendar as CalendarIcon, Users, CheckCircle, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

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
        { name: 'Scheduled', value: scheduled, color: '#0ea5e9' },
        { name: 'Completed', value: completed, color: '#10b981' }
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl text-white p-3.5 border border-indigo-500/30 shadow-2xl rounded-2xl">
          <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Session Status</span>
          </div>
          <p className="text-sm font-medium text-slate-200">
            {item.payload.name}: <span className="font-bold text-white text-base ml-1">{item.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const BAR_STROKES = ['#0284c7', '#047857'];

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
          {/* Stat cards wrapper with custom prominent outline borders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="[&>div]:border-2 [&>div]:border-slate-300 [&>div]:rounded-2xl [&>div]:shadow-sm">
              <StatCard
                title="Total Sessions"
                value={data.total.toString()}
                icon={Users}
                contextLine="Institution Wide"
              />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-blue-400 [&>div]:rounded-2xl [&>div]:shadow-sm [&>div]:bg-blue-50/70">
              <StatCard
                title="Scheduled Sessions"
                value={data.scheduled.toString()}
                icon={CalendarIcon}
                contextType="warning"
                contextLine="Upcoming"
              />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-emerald-400 [&>div]:rounded-2xl [&>div]:shadow-sm [&>div]:bg-emerald-50/70">
              <StatCard
                title="Completed Sessions"
                value={data.completed.toString()}
                icon={CheckCircle}
                contextType="success"
                contextLine="Finished"
              />
            </div>
          </div>

          {/* Clean Modern Vertical Bar Chart for Remedial Sessions */}
          <ChartCard title="Remedial Session Status" description="Distribution of current remedial sessions">
            {data.total === 0 ? (
              <div className="flex h-[380px] items-center justify-center text-slate-500 text-lg font-medium">
                No remedial sessions have been scheduled or recorded yet.
              </div>
            ) : (
              <div className="h-[400px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.remedialDist} margin={{ top: 35, right: 30, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="remedialGrad0" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.85}/>
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="remedialGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.85}/>
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#334155', fontSize: 14, fontWeight: 700 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
                    <Bar 
                      dataKey="value" 
                      radius={[12, 12, 0, 0]} 
                      barSize={70}
                      strokeWidth={2}
                    >
                      {data.remedialDist.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#remedialGrad${index})`} 
                          stroke={BAR_STROKES[index]} 
                        />
                      ))}
                      <LabelList 
                        dataKey="value" 
                        position="top" 
                        style={{ fill: '#1e293b', fontSize: 14, fontWeight: 'bold' }} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
      ) : null}
    </>
  );
};