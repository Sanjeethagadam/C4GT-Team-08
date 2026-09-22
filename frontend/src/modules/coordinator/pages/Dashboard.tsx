import { useEffect, useState } from 'react';
import { PageHeader, StatCard, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { AlertTriangle, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    <>
      <PageHeader 
        title="Support Operations Dashboard" 
        description="Overview of academic support activities and backlog metrics."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <StatCard 
              title="Total Students" 
              value={kpis?.totalStudents || 0} 
              icon={Users}
            />
            <StatCard 
              title="Active Backlog Students" 
              value={kpis?.studentsWithActiveBacklogs || 0} 
              icon={AlertTriangle}
              contextType={(kpis?.studentsWithActiveBacklogs || 0) > 0 ? "warning" : "success"}
            />
            <StatCard 
              title="Active Backlog Subjects" 
              value={kpis?.activeBacklogSubjects || 0} 
              icon={AlertTriangle}
              contextType={(kpis?.activeBacklogSubjects || 0) > 0 ? "warning" : "success"}
            />
            <StatCard 
              title="Scheduled Remedial Classes" 
              value={getCountByStatus(remedialStats, 'SCHEDULED')} 
              icon={AlertTriangle}
            />
            <StatCard 
              title="Scheduled Guest Lectures" 
              value={getCountByStatus(guestStats, 'SCHEDULED')} 
              icon={AlertTriangle}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Active Backlog Students by Year" description="Distribution across academic years">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={formatYearData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Active Backlog Students by Branch" description="Distribution across branches">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={formatBranchData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="Count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
};
