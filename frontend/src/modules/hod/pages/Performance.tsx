import { useEffect, useState } from 'react';
import { PageHeader, StatCard, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { HODFilterBar } from '../components/HODFilterBar';
import { analyticsService, type AnalyticsFilters } from '@/services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, TrendingUp, TrendingDown, Target } from 'lucide-react';

export const Performance = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [performanceData, setPerformanceData] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (currentFilters: AnalyticsFilters, sem?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = { ...currentFilters };
      if (sem) apiFilters.semesterCode = sem;
      
      const data = await analyticsService.getAcademicTrends(apiFilters);
      setPerformanceData(data);
      if (!sem && data?.targetSemesterCode) {
         setSelectedSemester(data.targetSemesterCode);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      setSelectedSemester('');
      loadData(filters);
    }
  }, [filters]);

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sem = e.target.value;
    setSelectedSemester(sem);
    loadData(filters, sem);
  };

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
    <>
      <PageHeader 
        title="Internal Exam Performance" 
        description="Detailed view of internal marks and academic trends (MID-1 / MID-2)."
      />
      
      {/* Highlighted Year of Study and Branch selection dropdowns */}
      <div className="mb-4 [&_select]:border-2 [&_select]:border-indigo-500 [&_select]:bg-indigo-50/40 [&_select]:rounded-xl [&_select]:shadow-sm [&_select]:font-semibold">
        <HODFilterBar onFilterChange={setFilters} />
      </div>

      {/* Highlighted Semester selection dropdown box */}
      <div className="bg-white p-4 rounded-2xl border-2 border-indigo-400 shadow-sm flex items-center gap-4 mb-6 bg-indigo-50/30">
        <label className="text-sm font-bold text-slate-800">Semester:</label>
        <select 
          className="border-2 border-indigo-500 bg-indigo-50/40 rounded-xl shadow-sm focus:ring-primary focus:border-primary p-2 border text-sm font-semibold disabled:bg-slate-100"
          value={selectedSemester}
          onChange={handleSemesterChange}
          disabled={availableSemesters.length === 0}
        >
          {availableSemesters.length === 0 && <option value="">No Data</option>}
          {availableSemesters.map((s: string) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <span className="text-xs text-slate-500 italic">Only semesters with actual internal examination records are meaningful.</span>
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
        <ErrorState message={error} onRetry={() => loadData(filters, selectedSemester)} />
      ) : (
        <div className="space-y-6">
          {/* Highlighted Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="[&>div]:border-2 [&>div]:border-indigo-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-indigo-50/40">
              <StatCard title="Average Marks" value={kpis?.averageMarks ? kpis.averageMarks.toFixed(1) + '%' : 'N/A'} icon={BookOpen} />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-emerald-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-emerald-50/40">
              <StatCard title="Highest Average" value={kpis?.highestAverage ? kpis.highestAverage.toFixed(1) + '%' : 'N/A'} icon={TrendingUp} contextType={kpis ? "success" : "neutral"} />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-rose-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-rose-50/40">
              <StatCard title="Lowest Average" value={kpis?.lowestAverage && kpis.lowestAverage !== 100 ? kpis.lowestAverage.toFixed(1) + '%' : 'N/A'} icon={TrendingDown} contextType={kpis ? "danger" : "neutral"} />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-amber-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-amber-50/40">
              <StatCard title="Exams Recorded" value={kpis?.examsRecorded || 0} icon={Target} />
            </div>
          </div>

          {/* Highlighted Chart Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border-2 border-indigo-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="Mark Distribution" description="Internal exam marks grouped by percentage">
                {distribution.length === 0 || distribution.every((d: any) => d.count === 0) ? (
                  <div className="flex h-full items-center justify-center text-slate-500 py-12">No internal examination marks available for this selection.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="range"
                        label
                      >
                        {distribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={DIST_COLORS[entry.range as keyof typeof DIST_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            <div className="rounded-3xl border-2 border-blue-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="MID-1 vs MID-2 Average" description="Direct comparison of average marks">
                {trends.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-500 py-12">No internal examination marks available for this selection.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={trends} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Bar dataKey="averageMarks" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average Marks" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </div>
        </div>
      )}
    </>
  );
};