import { useEffect, useState } from 'react';
import { LoadingSkeleton, ErrorState, DataTable, StatusBadge } from '@/components/common';
import { resultService, type Backlog } from '@/services/resultService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle } from 'lucide-react';

export const MyBacklogs = () => {
  const [backlogs, setBacklogs] = useState<Backlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resultService.getMyBacklogs();
      setBacklogs(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load backlogs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeBacklogs = backlogs.filter(b => b?.status === 'ACTIVE');
  const clearedBacklogs = backlogs.filter(b => b?.status === 'CLEARED');
  
  let riskLevel = 'LOW';
  let riskCardClasses = 'bg-emerald-50 border-emerald-400 text-emerald-900';
  if (activeBacklogs.length >= 5) {
    riskLevel = 'HIGH';
    riskCardClasses = 'bg-rose-50 border-rose-400 text-rose-900';
  } else if (activeBacklogs.length >= 2) {
    riskLevel = 'MEDIUM';
    riskCardClasses = 'bg-amber-50 border-amber-400 text-amber-900';
  }

  const chartData = [
    { name: 'Active', value: activeBacklogs.length, color: '#f43f5e' },
    { name: 'Cleared', value: clearedBacklogs.length, color: '#10b981' }
  ].filter(d => d.value > 0);

  const semesterCount: Record<string, number> = {};
  backlogs.forEach(b => {
    const sem = ((b as any)?.semesterId as any)?.semesterCode || 'Unknown';
    semesterCount[sem] = (semesterCount[sem] || 0) + 1;
  });
  const barChartData = Object.keys(semesterCount).sort().map(sem => ({
    semester: sem,
    count: semesterCount[sem]
  }));

  const columns = [
    { header: 'Subject Code', cell: (row: Backlog) => row?.subjectId?.subjectCode || '-' },
    { header: 'Subject Name', cell: (row: Backlog) => <span className="font-bold text-slate-900">{row?.subjectId?.subjectName || '-'}</span> },
    { header: 'Semester', cell: (row: any) => row?.academicSemesterId?.semesterCode || '-' },
    { 
      header: 'Status', 
      cell: (row: Backlog) => (
        <StatusBadge status={row?.status === 'ACTIVE' ? 'danger' : 'success'} label={row?.status || '-'} />
      ) 
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border-4 border-indigo-400">
        <div className="px-8 py-6 border-b-4 border-emerald-500 bg-slate-900">
          <h1 className="text-xl font-black text-white tracking-wide">MY BACKLOGS</h1>
          <p className="text-slate-300 text-sm mt-1 font-semibold">Track your active backlog subjects, cleared subjects, and academic risk status.</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          {/* Four Colorful Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card 1: Total Backlog History */}
            <Card className="rounded-3xl shadow-lg border-4 border-blue-400 bg-blue-50/60">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <span className="text-blue-900 text-xs font-black uppercase tracking-wider mb-2">Total Backlog History</span>
                <span className="text-4xl font-black text-blue-700">{backlogs.length}</span>
              </CardContent>
            </Card>

            {/* Card 2: Cleared Subjects */}
            <Card className="rounded-3xl shadow-lg border-4 border-emerald-400 bg-emerald-50/60">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <span className="text-emerald-900 text-xs font-black uppercase tracking-wider mb-2">Cleared Subjects</span>
                <span className="text-4xl font-black text-emerald-700">{clearedBacklogs.length}</span>
              </CardContent>
            </Card>

            {/* Card 3: Remaining Active Backlogs */}
            <Card className="rounded-3xl shadow-lg border-4 border-rose-400 bg-rose-50/60">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <span className="text-rose-900 text-xs font-black uppercase tracking-wider mb-2">Remaining Active Backlogs</span>
                <span className="text-4xl font-black text-rose-700">{activeBacklogs.length}</span>
              </CardContent>
            </Card>

            {/* Card 4: Academic Risk */}
            <Card className={`rounded-3xl shadow-lg border-4 ${riskCardClasses}`}>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">Academic Risk</span>
                </div>
                <div className="text-3xl font-black">{riskLevel}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          {backlogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-3xl shadow-lg border-4 border-indigo-400 bg-white overflow-hidden">
                <CardHeader className="bg-slate-100 border-b-2 border-slate-200 px-6 py-4">
                  <CardTitle className="text-slate-900 font-black text-sm">Active vs Cleared</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-lg border-4 border-indigo-400 bg-white overflow-hidden">
                <CardHeader className="bg-slate-100 border-b-2 border-slate-200 px-6 py-4">
                  <CardTitle className="text-slate-900 font-black text-sm">Backlogs by Semester</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[250px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="semester" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-lg border-4 border-indigo-400 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b-2 border-slate-200 bg-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Backlog Records</h3>
            </div>
            <DataTable 
              data={backlogs} 
              columns={columns}
              emptyMessage="Great job! You have no backlog records."
            />
          </div>
        </>
      )}
    </div>
  );
};