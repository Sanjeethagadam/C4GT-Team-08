import { useEffect, useState } from 'react';
import { StatCard, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { Users, BookOpen, Calendar, Presentation } from 'lucide-react';
import { AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const [remedialStats, setRemedialStats] = useState<any[]>([]);
  const [guestStats, setGuestStats] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [remedials, guests, kpiData] = await Promise.all([
          analyticsService.getRemedialStats(),
          analyticsService.getGuestLectureStats(),
          analyticsService.getCampusKPIs()
        ]);
        
        setRemedialStats(remedials || []);
        setGuestStats(guests || []);
        setKpis(kpiData || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load coordinator data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getCountByStatus = (stats: any[], status: string) => {
    const item = stats.find(s => s._id === status);
    return item ? item.count : 0;
  };

  const formatBranchData = () => {
    if (!kpis?.backlogBranches) return [];
    return kpis.backlogBranches.map((b: any) => ({
      name: b.branchCode,
      Count: b.count
    }));
  };

  const formatYearData = () => {
    if (!kpis?.backlogYears) return [];
    return kpis.backlogYears.map((y: any) => ({
      name: `Year ${y.year}`,
      Count: y.count
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border-4 border-indigo-400">
        <div className="px-8 py-6 border-b-4 border-emerald-500 bg-slate-900">
          <h1 className="text-xl font-black text-white tracking-wide">SUPPORT OPERATIONS DASHBOARD</h1>
          <p className="text-slate-300 text-sm mt-1 font-semibold">Overview of academic support activities and backlog metrics.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="space-y-6">
          {/* Stat Cards with soft light color fills and vibrant borders */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 rounded-3xl border-2 border-indigo-300 p-2 shadow-md">
              <StatCard 
                title="Active Backlog Students" 
                value={kpis?.studentsWithActiveBacklogs || 0} 
                icon={Users}
                contextType={(kpis?.studentsWithActiveBacklogs || 0) > 0 ? "warning" : "success"}
              />
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 rounded-3xl border-2 border-blue-300 p-2 shadow-md">
              <StatCard 
                title="Active Backlog Subjects" 
                value={kpis?.activeBacklogSubjects || 0} 
                icon={BookOpen}
                contextType={(kpis?.activeBacklogSubjects || 0) > 0 ? "warning" : "success"}
              />
            </div>
            <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 rounded-3xl border-2 border-emerald-300 p-2 shadow-md">
              <StatCard 
                title="Scheduled Remedial Classes" 
                value={getCountByStatus(remedialStats, 'SCHEDULED')} 
                icon={Calendar}
              />
            </div>
            <div className="bg-gradient-to-br from-purple-50 via-white to-slate-50 rounded-3xl border-2 border-purple-300 p-2 shadow-md">
              <StatCard 
                title="Scheduled Guest Lectures" 
                value={getCountByStatus(guestStats, 'SCHEDULED')} 
                icon={Presentation}
              />
            </div>
          </div>
          
          {/* Chart Cards with soft tinted background and clean accent borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-50/50 via-white to-white rounded-3xl border-2 border-indigo-300 p-3 shadow-lg">
              <ChartCard title="Active Backlog Students by Year" description="Distribution across academic years (Modern Area Trend)">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={formatYearData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }} 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #6366f1', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a', fontWeight: 'bold' }} 
                    />
                    <Area type="monotone" dataKey="Count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#yearGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/50 via-white to-white rounded-3xl border-2 border-emerald-300 p-3 shadow-lg">
              <ChartCard title="Active Backlog Students by Branch" description="Distribution across branches (Modern Structured Bars)">
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={formatBranchData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }} 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #10b981', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a', fontWeight: 'bold' }} 
                    />
                    <Bar dataKey="Count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={36} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};