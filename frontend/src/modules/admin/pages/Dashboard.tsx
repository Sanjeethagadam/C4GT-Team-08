import { useEffect, useState } from 'react';
import { PageHeader, StatCard, LoadingSkeleton, ErrorState } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { Users, Building, BookOpen, GraduationCap } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dashboardData = await analyticsService.getAdminDashboard();
        setData(dashboardData);
      } catch (err: any) {
        setError(err.message || 'Failed to load system stats');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const BRANCH_COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#0d9488'];
  const YEAR_COLORS = ['#0284c7', '#2563eb', '#4f46e5', '#7c3aed'];
  const ROLE_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];
  const RISK_COLORS: { [key: string]: string } = { 'LOW': '#059669', 'MEDIUM': '#d97706', 'HIGH': '#dc2626' };

  return (
    <div className="space-y-6 pb-10 w-full bg-[#f0f4ff] p-6 rounded-2xl min-h-full">
      <PageHeader 
        title="System Dashboard" 
        description="Overview of system configuration and health."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : data ? (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-100/90 via-blue-50/60 to-white border-2 border-blue-500 shadow-md rounded-2xl p-2.5">
              <StatCard 
                title="Registered Campuses" 
                value={data.kpis.registeredCampuses} 
                icon={Building}
                contextType="neutral"
              />
            </div>
            <div className="bg-gradient-to-br from-indigo-100/90 via-indigo-50/60 to-white border-2 border-indigo-500 shadow-md rounded-2xl p-2.5">
              <StatCard 
                title="Registered Subjects" 
                value={data.kpis.registeredSubjects} 
                icon={BookOpen}
                contextType="neutral"
              />
            </div>
            <div className="bg-gradient-to-br from-purple-100/90 via-purple-50/60 to-white border-2 border-purple-500 shadow-md rounded-2xl p-2.5">
              <StatCard 
                title="Active Users" 
                value={data.kpis.activeUsers} 
                icon={Users}
                contextType="neutral"
              />
            </div>
            <div className="bg-gradient-to-br from-emerald-100/90 via-emerald-50/60 to-white border-2 border-emerald-500 shadow-md rounded-2xl p-2.5">
              <StatCard 
                title="Total Students" 
                value={data.kpis.totalStudents} 
                icon={GraduationCap}
                contextType="neutral"
              />
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white backdrop-blur-md p-5 rounded-2xl shadow-sm border-2 border-slate-300">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-lg font-bold text-slate-900">Students by Branch</h3>
                <span className="text-xs font-bold px-3 py-1 bg-blue-600 text-white rounded-full shadow-sm">Distribution</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.studentsByBranch} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.7} />
                    <XAxis dataKey="branchCode" stroke="#334155" fontSize={12} tickLine={false} fontWeight={700} />
                    <YAxis stroke="#334155" fontSize={12} tickLine={false} fontWeight={700} />
                    <RechartsTooltip cursor={{ fill: '#e2e8f0' }} contentStyle={{ borderRadius: '12px', border: '2px solid #94a3b8' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Students">
                      {data.charts.studentsByBranch.map((_: any, index: number) => (
                        <Cell key={`branch-cell-${index}`} fill={BRANCH_COLORS[index % BRANCH_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white backdrop-blur-md p-5 rounded-2xl shadow-sm border-2 border-slate-300">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-lg font-bold text-slate-900">Students by Year</h3>
                <span className="text-xs font-bold px-3 py-1 bg-indigo-600 text-white rounded-full shadow-sm">Academic Year</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.studentsByYear} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.7} />
                    <XAxis dataKey="year" stroke="#334155" fontSize={12} tickLine={false} fontWeight={700} />
                    <YAxis stroke="#334155" fontSize={12} tickLine={false} fontWeight={700} />
                    <RechartsTooltip cursor={{ fill: '#e2e8f0' }} contentStyle={{ borderRadius: '12px', border: '2px solid #94a3b8' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Students">
                      {data.charts.studentsByYear.map((_: any, index: number) => (
                        <Cell key={`year-cell-${index}`} fill={YEAR_COLORS[index % YEAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white backdrop-blur-md p-5 rounded-2xl shadow-sm border-2 border-slate-300">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-lg font-bold text-slate-900">Users by Role</h3>
                <span className="text-xs font-bold px-3 py-1 bg-purple-600 text-white rounded-full shadow-sm">System Roles</span>
              </div>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts.usersByRole}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      label
                    >
                      {data.charts.usersByRole.map((_: any, index: number) => (
                        <Cell key={`role-cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '2px solid #94a3b8' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white backdrop-blur-md p-5 rounded-2xl shadow-sm border-2 border-slate-300">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-lg font-bold text-slate-900">Institution Risk Distribution</h3>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-600 text-white rounded-full shadow-sm">Health Check</span>
              </div>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts.riskDistribution}
                      dataKey="count"
                      nameKey="level"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {data.charts.riskDistribution.map((entry: any, index: number) => (
                        <Cell key={`risk-cell-${index}`} fill={RISK_COLORS[entry.level] || '#2563eb'} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '2px solid #94a3b8' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};