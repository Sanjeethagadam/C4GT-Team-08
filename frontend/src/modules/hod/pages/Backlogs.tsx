import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard, StatCard } from '@/components/common';
import { HODFilterBar } from '../components/HODFilterBar';
import { analyticsService, type AnalyticsFilters } from '@/services/analyticsService';
import { AlertTriangle, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LabelList } from 'recharts';

const SemesterTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg z-50">
        <p className="font-semibold text-slate-800 mb-1">Semester {label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className={`text-sm ${entry.name === 'Active Backlogs' ? 'text-rose-600' : 'text-emerald-600'}`}>
            {entry.name}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BranchTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg z-50">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        <p className="text-sm text-blue-600">Active Backlogs: <span className="font-medium">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

const SubjectTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg z-50">
        <p className="font-semibold text-slate-800 mb-1 max-w-[250px] whitespace-normal break-words">{label}</p>
        <p className="text-sm text-rose-600">Active Backlog Subjects: <span className="font-medium">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

export const Backlogs = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [backlogsData, setBacklogsData] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (currentFilters: AnalyticsFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getBacklogsDistribution(currentFilters);
      setBacklogsData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load backlogs distribution');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadData(filters);
    }
  }, [filters]);

  const activeBacklogSubjects = backlogsData?.activeBacklogSubjects || 0;
  const totalEver = backlogsData?.totalEver || 0;
  const branchDist = backlogsData?.branchDist || [];
  const subjectDist = backlogsData?.subjectDist || [];
  const semesterDist = backlogsData?.semesterDist || [];
  const statusDist = backlogsData?.statusDist || [];

  return (
    <>
      <PageHeader 
        title="Historical & Active Backlogs" 
        description="Monitor uncleared subjects and overall backlog trends across your department."
      />
      
      {/* Highlighted Filter Bar */}
      <div className="mb-6 [&_select]:border-2 [&_select]:border-indigo-500 [&_select]:bg-indigo-50/40 [&_select]:rounded-xl [&_select]:shadow-sm [&_select]:font-semibold">
        <HODFilterBar onFilterChange={setFilters} />
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
        <ErrorState message={error} onRetry={() => loadData(filters)} />
      ) : activeBacklogSubjects === 0 && totalEver === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border-2 border-indigo-200 p-8 text-center text-slate-500 text-lg font-bold bg-indigo-50/10">
          No backlog data available for this selection.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="[&>div]:border-2 [&>div]:border-rose-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-rose-50/40">
              <StatCard 
                title="Currently Active" 
                value={activeBacklogSubjects} 
                icon={AlertTriangle}
                contextType={activeBacklogSubjects > 0 ? 'danger' : 'success'}
              />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-blue-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-blue-50/40">
              <StatCard 
                title="Historically Recorded" 
                value={totalEver} 
                icon={Clock}
              />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-emerald-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-emerald-50/40">
              <StatCard 
                title="Historically Cleared" 
                value={statusDist.find((s: any) => s.name === 'Cleared')?.count || 0} 
                icon={CheckCircle}
                contextType="success"
              />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-indigo-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-indigo-50/40">
              <StatCard 
                title="Subjects Affected (Active)" 
                value={subjectDist.length} 
                icon={BookOpen}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl border-2 border-indigo-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="Backlogs by Semester (Active vs Cleared)" description="Trend of backlogs generated per semester and their current clearance status">
                {semesterDist.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-500 py-12">No historical backlog data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={semesterDist} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="semester" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<SemesterTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Legend />
                      <Bar dataKey="active" stackId="a" fill="#ef4444" name="Active Backlogs">
                        <LabelList dataKey="active" position="inside" fill="#ffffff" fontSize={12} formatter={(val: any) => val > 0 ? val : ''} />
                      </Bar>
                      {semesterDist.some((s:any) => s.cleared > 0) && (
                        <Bar dataKey="cleared" stackId="a" fill="#10b981" name="Cleared Backlogs" radius={[4, 4, 0, 0]}>
                          <LabelList dataKey="cleared" position="inside" fill="#ffffff" fontSize={12} formatter={(val: any) => val > 0 ? val : ''} />
                        </Bar>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
            
            <div className="lg:col-span-1 rounded-3xl border-2 border-emerald-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="Overall Clearance Status" description="Proportion of backlogs cleared">
                {statusDist.length === 0 || totalEver === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-500 py-12">No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={statusDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="name"
                        labelLine={false}
                        label={false}
                      >
                        {statusDist.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Cleared' ? '#10b981' : '#ef4444'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-bold text-xl fill-slate-800">
                        {statusDist.length === 1 && statusDist[0].name === 'Active' ? '100% Active' : 
                         statusDist.length === 1 && statusDist[0].name === 'Cleared' ? '100% Cleared' : 
                         `${Math.round((statusDist.find((s:any)=>s.name==='Cleared')?.count || 0) / totalEver * 100)}% Cleared`}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border-2 border-blue-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="Active Backlogs by Branch" description="Currently active backlogs distributed by branch">
                {branchDist.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-500 py-12">No active backlogs</div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={branchDist} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="_id" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<BranchTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active Backlogs">
                        <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} formatter={(val: any) => val > 0 ? val : ''} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            <div className="rounded-3xl border-2 border-rose-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="Top 10 Backlog Subjects (Active)" description="Subjects with the highest number of active backlogs">
                {subjectDist.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-500 py-12">No active backlogs</div>
                ) : (
                  <div style={{ height: 500, overflowY: 'auto', paddingRight: '10px' }}>
                    <ResponsiveContainer width="100%" height={Math.max(500, subjectDist.length * 50)}>
                      <BarChart data={subjectDist} layout="vertical" margin={{ top: 20, right: 40, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="_id" type="category" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={200} interval={0} />
                        <Tooltip content={<SubjectTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} name="Active Backlogs" barSize={30}>
                          <LabelList dataKey="count" position="right" fill="#64748b" fontSize={12} fontWeight={500} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>
            </div>
          </div>
        </div>
      )}
    </>
  );
};