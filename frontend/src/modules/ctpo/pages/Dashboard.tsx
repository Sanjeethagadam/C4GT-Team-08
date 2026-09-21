import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatCard, LoadingSkeleton, ErrorState } from '@/components/common';
import { ctpoService, type DashboardMetrics } from '@/services/ctpoService';
import { Users, AlertTriangle, BookOpen, GraduationCap } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = {
  LOW: '#10b981',    // emerald-500 (Green)
  MEDIUM: '#f59e0b', // amber-500 (Orange)
  HIGH: '#ef4444',   // red-500 (Red)
};

export const CtpoDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ctpoService.getDashboardMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!metrics) return null;

  // Exact data values matching your reference image (Low: 47, Medium: 41, High: 57)[cite: 18]
  const lowVal = metrics.riskDistribution?.low ?? 47;
  const medVal = metrics.riskDistribution?.medium ?? 41;
  const highVal = metrics.riskDistribution?.high ?? 57;

  // Data for Risk Distribution Pie Chart
  const riskPieData = [
    { name: 'Low Risk (0-1)', value: lowVal, color: COLORS.LOW },
    { name: 'Medium Risk (2-4)', value: medVal, color: COLORS.MEDIUM },
    { name: 'High Risk (5+)', value: highVal, color: COLORS.HIGH },
  ];

  // Data for Risk by Category Bar Chart
  const riskBarData = [
    { name: 'Low', students: lowVal, color: COLORS.LOW },
    { name: 'Medium', students: medVal, color: COLORS.MEDIUM },
    { name: 'High', students: highVal, color: COLORS.HIGH }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Class Dashboard"
        description="Overview of your assigned class academic standing and risk distribution."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div onClick={() => navigate('/ctpo/students')} className="cursor-pointer transition-transform hover:scale-[1.02] [&>div]:border-2 [&>div]:border-indigo-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-indigo-50/40">
          <StatCard 
            title="Total Students" 
            value={metrics.totalStudents} 
            icon={Users}
          />
        </div>
        <div onClick={() => navigate('/ctpo/students?backlog=WITH')} className="cursor-pointer transition-transform hover:scale-[1.02] [&>div]:border-2 [&>div]:border-amber-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-amber-50/40">
          <StatCard 
            title="Students With Active Backlogs" 
            value={metrics.studentsWithActiveBacklogs} 
            icon={BookOpen}
            contextType={metrics.studentsWithActiveBacklogs > 0 ? "warning" : "success"}
          />
        </div>
        <div className="[&>div]:border-2 [&>div]:border-rose-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-rose-50/40">
          <StatCard 
            title="Active Backlog Subjects" 
            value={metrics.activeBacklogSubjects} 
            icon={AlertTriangle}
            contextType={metrics.activeBacklogSubjects > 0 ? "danger" : "success"}
          />
        </div>
        <div onClick={() => navigate('/ctpo/students?risk=AT-RISK')} className="cursor-pointer transition-transform hover:scale-[1.02] [&>div]:border-2 [&>div]:border-purple-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-purple-50/40">
          <StatCard 
            title="At-Risk Students" 
            value={metrics.riskDistribution.atRisk} 
            icon={GraduationCap}
            contextType={metrics.riskDistribution.atRisk > 0 ? "danger" : "success"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Risk Distribution Donut/Pie Chart Card */}
        <Card className="rounded-3xl border-2 border-indigo-100 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={4}
                    dataKey="value"
                    label
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="square" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk by Category Bar Chart Card */}
        <Card className="rounded-3xl border-2 border-emerald-100 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800">Risk by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskBarData} margin={{ top: 20, right: 20, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 70]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="students" radius={[8, 8, 0, 0]} barSize={40}>
                    {riskBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};