import { useEffect, useState, useMemo } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable, ChartCard } from '@/components/common';
import { ctpoService } from '@/services/ctpoService';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'LOW': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'AT-RISK': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const RISK_COLORS: Record<string, string> = {
  'LOW': '#10b981',
  'MEDIUM': '#f59e0b',
  'HIGH': '#ef4444'
};

export const Backlogs = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resData = await ctpoService.getStudentsList({ backlog: 'WITH' });
      setStudents(resData);
    } catch (err: any) {
      setError(err.message || 'Failed to load class backlogs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregations for charts
  const { semesterData, subjectData, riskData } = useMemo(() => {
    const semMap: Record<string, number> = {};
    const subMap: Record<string, number> = {};
    const riskMap: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };

    students.forEach(s => {
      // Risk distribution
      if (riskMap[s.riskLevel] !== undefined) riskMap[s.riskLevel]++;

      // Semester & Subject backlogs
      s.backlogDetails?.forEach((b: any) => {
        semMap[b.semesterCode] = (semMap[b.semesterCode] || 0) + 1;
        subMap[b.subjectName] = (subMap[b.subjectName] || 0) + 1;
      });
    });

    const sData = Object.keys(semMap)
      .sort()
      .map(k => ({ name: k, count: semMap[k] }));

    const subData = Object.keys(subMap)
      .sort((a, b) => subMap[b] - subMap[a])
      .slice(0, 10) // Top 10 subjects
      .map(k => ({ name: k, count: subMap[k] }));

    const rData = Object.keys(riskMap)
      .filter(k => riskMap[k] > 0)
      .map(k => ({ name: k, count: riskMap[k] }));

    return { semesterData: sData, subjectData: subData, riskData: rData };
  }, [students]);

  const columns = [
    { header: 'Roll No', cell: (row: any) => <span className="font-semibold text-slate-800">{row.rollNo || '-'}</span> },
    { header: 'Name', cell: (row: any) => <span className="font-medium text-slate-700">{row.name || '-'}</span> },
    { header: 'Active Backlogs', cell: (row: any) => (
      <span className="font-bold text-amber-600">{row.activeBacklogCount}</span>
    ) },
    { header: 'Risk Level', cell: (row: any) => (
      <Badge variant="outline" className={`font-medium rounded-xl px-2.5 py-0.5 ${getRiskColor(row.riskLevel)}`}>
        {row.riskLevel}
      </Badge>
    ) },
    { header: 'Subjects (Semesters)', cell: (row: any) => (
      <div className="flex flex-col gap-1 text-sm">
        {row.backlogDetails?.map((b: any, i: number) => (
          <span key={i} className="text-slate-600 font-medium">
            • {b.subjectName} <span className="text-indigo-500 font-semibold">({b.semesterCode})</span>
          </span>
        ))}
      </div>
    ) }
  ];

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Class Backlogs" 
        description="Students in your assigned class with one or more active backlogs." 
      />
      
      {students.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart Card 1 - Backlogs by Semester */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-indigo-100 transition-all hover:shadow-lg">
            <h3 className="font-bold text-slate-700 mb-4 px-1">Backlogs by Semester</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={semesterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '16px', border: '2px solid #e0e7ff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Card 2 - Top Subjects by Backlogs */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-indigo-100 transition-all hover:shadow-lg">
            <h3 className="font-bold text-slate-700 mb-4 px-1">Top Subjects by Backlogs</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} width={110} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '16px', border: '2px solid #e0e7ff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Card 3 - Risk Distribution */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-indigo-100 transition-all hover:shadow-lg">
            <h3 className="font-bold text-slate-700 mb-4 px-1">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: '2px solid #e0e7ff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main DataTable Container with matching Indigo borders and rounded layout */}
      <div className="bg-white p-6 rounded-3xl shadow-md border-2 border-indigo-100 transition-all hover:shadow-lg">
        <DataTable columns={columns} data={students} emptyMessage="No active backlogs found in this class." />
      </div>
    </div>
  );
};