import { useEffect, useState } from 'react';
import { PageHeader, StatCard, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { ctpoService } from '@/services/ctpoService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, TrendingUp, TrendingDown, Target } from 'lucide-react';

export const Performance = () => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ctpoService.getPerformance();
      setPerformanceData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const trends = performanceData?.trends || [];
  const distribution = performanceData?.distribution || [];
  const kpis = performanceData?.kpis || null;
  const availableSemesters = performanceData?.availableSemesters || [];

  const DIST_COLORS = {
    '0-39': '#ef4444',
    '40-59': '#f59e0b',
    '60-74': '#3b82f6',
    '75-89': '#8b5cf6',
    '90-100': '#10b981'
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Class Performance" 
        description="Detailed view of internal marks and academic trends (MID-1 / MID-2) for your class."
      />

      {/* Highlighted Semester Filter Bar */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/40 p-4 rounded-3xl border-2 border-indigo-200 shadow-md flex items-center gap-4 mb-6 mt-6">
        <label className="text-sm font-bold text-slate-800">Semester:</label>
        <select 
          className="border-indigo-300 rounded-xl shadow-sm focus:ring-primary focus:border-primary p-2 border text-sm disabled:bg-slate-50 font-semibold text-slate-700 bg-white"
          value={availableSemesters.length > 0 ? availableSemesters[0] : ''}
          disabled={true}
        >
          {availableSemesters.length === 0 && <option value="">No Data</option>}
          {availableSemesters.map((s: string) => <option key={s} value={s}>Semester Scope</option>)}
        </select>
        <span className="text-xs text-indigo-900/60 font-semibold italic">This is fixed to your assigned CTPO scope.</span>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : !kpis ? (
        <div className="bg-white rounded-3xl shadow-md border-2 border-slate-100 p-8 text-center text-slate-500 text-lg font-medium">
          No internal examination marks available for this selection.
        </div>
      ) : (
        <div className="space-y-6">
          {kpis && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="transition-transform hover:scale-[1.02] [&>div]:border-2 [&>div]:border-indigo-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-indigo-50/40">
                <StatCard title="Average Marks" value={kpis.averageMarks ? kpis.averageMarks.toFixed(1) + '%' : '0%'} icon={BookOpen} />
              </div>
              <div className="transition-transform hover:scale-[1.02] [&>div]:border-2 [&>div]:border-emerald-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-emerald-50/40">
                <StatCard title="Highest Average" value={kpis.highestAverage ? kpis.highestAverage.toFixed(1) + '%' : '0%'} icon={TrendingUp} contextType="success" />
              </div>
              <div className="transition-transform hover:scale-[1.02] [&>div]:border-2 [&>div]:border-rose-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-rose-50/40">
                <StatCard title="Lowest Average" value={kpis.lowestAverage && kpis.lowestAverage !== 100 ? kpis.lowestAverage.toFixed(1) + '%' : '0%'} icon={TrendingDown} contextType="danger" />
              </div>
              <div className="transition-transform hover:scale-[1.02] [&>div]:border-2 [&>div]:border-purple-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-purple-50/40">
                <StatCard title="Exams Recorded" value={kpis.examsRecorded} icon={Target} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Highlighted Mark Distribution Chart Card */}
            <div className="[&>div]:rounded-3xl [&>div]:border-2 [&>div]:border-purple-200 [&>div]:shadow-md [&>div]:bg-white overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="Mark Distribution" description="Internal exam marks grouped by percentage">
                {distribution.length === 0 || distribution.every((d: any) => d.count === 0) ? (
                  <div className="flex h-64 items-center justify-center text-slate-500 font-medium">No internal examination marks available for this selection.</div>
                ) : (
                  <div className="h-64 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="range"
                          label
                        >
                          {distribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={DIST_COLORS[entry.range as keyof typeof DIST_COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="square" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>
            </div>

            {/* Highlighted MID-1 vs MID-2 Average Bar Chart Card */}
            <div className="[&>div]:rounded-3xl [&>div]:border-2 [&>div]:border-blue-200 [&>div]:shadow-md [&>div]:bg-white overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="MID-1 vs MID-2 Average" description="Direct comparison of average marks">
                {trends.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-slate-500 font-medium">No internal examination marks available for this selection.</div>
                ) : (
                  <div className="h-64 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="square" />
                        <Bar dataKey="averageMarks" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} name="Average Marks" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};