import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard, StatCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { AlertCircle, Users, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Backlogs = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [backlogs] = await Promise.all([
        analyticsService.getBacklogsDistribution()
      ]);

      const activeBacklogSubjects = backlogs.activeBacklogSubjects;
      const totalEver = backlogs.totalEver;
      const cleared = totalEver - activeBacklogSubjects;

      const uniqueStudentsWithBacklogs = backlogs.studentsWithActiveBacklogs;

      const branchDist = backlogs.branchDist?.map((b: any) => ({ name: b._id, value: b.count })) || [];
      const subjectDist = backlogs.subjectDist?.map((s: any) => ({ name: s._id, value: s.count }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 10)
        .reverse() || [];
      const semesterDist = backlogs.semesterDist?.map((s: any) => ({ name: s.semester, active: s.active, cleared: s.cleared })) || [];
      
      const statusDist = backlogs.statusDist?.map((s: any) => ({ name: s.name, value: s.count })) || [];

      const yearsPerf = await analyticsService.getYearsPerformance();
      const yearDist = yearsPerf.map((y: any) => ({
        name: y.name,
        value: y.activeBacklogs || 0
      }));

      setData({
        activeBacklogSubjects,
        uniqueStudentsWithBacklogs,
        clearedBacklogs: cleared,
        branchDist,
        subjectDist,
        semesterDist,
        statusDist,
        yearDist
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load backlog data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const truncateText = (text: string, length: number) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const SubjectTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-lg max-w-xs">
          <p className="font-medium text-slate-800 mb-1">{label}</p>
          <p className="text-sm font-bold text-violet-600">Active Backlog Subjects: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <PageHeader 
        title="Backlog Analysis" 
        description="Detailed breakdown and monitoring of student backlogs."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Active Backlog Subjects"
              value={data.activeBacklogSubjects.toString()}
              icon={AlertCircle}
              contextType="danger"
              contextLine="Current Institution Wide"
            />
            <StatCard
              title="Students With Active Backlogs"
              value={data.uniqueStudentsWithBacklogs.toString()}
              icon={Users}
              contextType="warning"
              contextLine="At least 1 active backlog"
            />
            <StatCard
              title="Cleared Backlogs"
              value={data.clearedBacklogs.toString()}
              icon={CheckCircle2}
              contextType="success"
              contextLine="Historical clears"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Backlogs by Branch" description="Active backlogs distributed across branches">
              {data.branchDist.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-slate-500">No backlog data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.branchDist} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Active Backlogs" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Backlogs by Year" description="Active backlogs distributed across cohorts">
              {data.yearDist.every((y:any) => y.value === 0) ? (
                <div className="flex h-[300px] items-center justify-center text-slate-500">No backlog data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.yearDist} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Active Backlogs" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Top Subjects with Backlogs" description="Subjects with the highest active backlog counts">
              {data.subjectDist.length === 0 ? (
                <div className="flex h-[450px] items-center justify-center text-slate-500">No backlog data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={data.subjectDist} margin={{ top: 20, right: 30, left: 10, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={220} tickFormatter={(val) => truncateText(val, 30)} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<SubjectTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Active Backlogs" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Active vs Cleared (By Semester)" description="Status of backlogs across semesters">
              {data.semesterDist.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-slate-500">No backlog data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.semesterDist} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar dataKey="active" stackId="a" fill="#f43f5e" name="Active" />
                    <Bar dataKey="cleared" stackId="a" fill="#10b981" name="Cleared" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </div>
      ) : null}
    </>
  );
};
