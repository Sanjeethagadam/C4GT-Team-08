import { useEffect, useState } from 'react';
import { PageHeader, StatCard, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { HODFilterBar } from '../components/HODFilterBar';
import { analyticsService, type AnalyticsFilters } from '@/services/analyticsService';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, LabelList } from 'recharts';
import { Users, BookOpen, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react';

const BacklogTrendTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg z-50">
        <p className="font-semibold text-slate-800 mb-1">Semester {data.semester}</p>
        <p className="text-sm text-slate-600">Students with Backlog: <span className="font-medium text-slate-800">{data.studentsWithBacklog}</span></p>
        <p className="text-sm text-slate-600">Total Students: <span className="font-medium text-slate-800">{data.totalScopedStudents}</span></p>
        <p className="text-sm text-rose-600">Active Backlogs: <span className="font-medium">{data.activeBacklogs}</span></p>
        <p className="text-sm text-rose-600 mt-1 font-medium">Backlog Rate: {(data.backlogRate || 0).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const SubjectTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg z-50">
        <p className="font-semibold text-slate-800 mb-1">{data.subject}</p>
        <p className="text-sm text-slate-600">Evaluated: <span className="font-medium text-slate-800">{data.evaluated}</span></p>
        <p className="text-sm text-emerald-600">Passed: <span className="font-medium">{data.pass}</span></p>
        <p className="text-sm text-rose-600">Failed: <span className="font-medium">{data.fail}</span></p>
        <p className="text-sm text-blue-600 mt-1 font-medium">Pass Rate: {data.passRate}%</p>
      </div>
    );
  }
  return null;
};

export const Results = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [resultsData, setResultsData] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (currentFilters: AnalyticsFilters, sem?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = { ...currentFilters };
      if (sem) apiFilters.semesterCode = sem;
      
      const data = await analyticsService.getResultsDistribution(apiFilters);
      setResultsData(data);
      if (!sem && data?.targetSemesterCode) {
         setSelectedSemester(data.targetSemesterCode);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load results distribution');
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

  const availableSemesters = resultsData?.availableSemesters || [];
  const kpis = resultsData?.kpis;
  const distribution = resultsData?.distribution || [];
  const subjectDistribution = resultsData?.subjectDistribution || [];
  const gradeDistribution = resultsData?.gradeDistribution || [];
  const trend = resultsData?.trend || [];

  return (
    <>
      <PageHeader 
        title="University Results" 
        description="Analyze official university/JNTUK historical and current results."
      />
      
      {/* Highlighted Filter Bar */}
      <div className="mb-4 [&_select]:border-2 [&_select]:border-indigo-500 [&_select]:bg-indigo-50/40 [&_select]:rounded-xl [&_select]:shadow-sm [&_select]:font-semibold">
        <HODFilterBar onFilterChange={setFilters} />
      </div>

      {/* Highlighted Semester Selection Box */}
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
        <span className="text-xs text-slate-500 italic">Select an academically applicable semester.</span>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(filters, selectedSemester)} />
      ) : resultsData?.status !== 'AVAILABLE' ? (
        <div className="space-y-6">
           <div className="bg-white rounded-2xl shadow-md border-2 border-indigo-200 p-8 text-center text-slate-500 bg-indigo-50/10">
             <p className="text-lg font-bold text-slate-800 mb-2">
               {resultsData?.status === 'NOT_ANNOUNCED' && "Results not announced yet."}
               {resultsData?.status === 'HISTORICAL_NOT_IMPORTED' && "Official university result data has not been imported for this historical semester."}
               {resultsData?.status === 'NOT_AVAILABLE' && "Results not available yet."}
               {resultsData?.status === 'ANNOUNCED_NOT_IMPORTED' && "Official result announced, but not yet imported."}
             </p>
             <p className="text-sm text-slate-600">Official university results will appear here once parsed and verified from the JNTUK source.</p>
           </div>
           
           {resultsData?.status === 'HISTORICAL_NOT_IMPORTED' && resultsData?.backlogSnapshot && (
             <div className="mt-8 space-y-6 border-t-2 border-slate-200 pt-8">
               <div className="mb-4">
                 <h3 className="text-xl font-bold text-slate-800">HISTORICAL BACKLOG SNAPSHOT</h3>
                 <p className="text-sm text-slate-500">Backlog History for this semester (University Results not imported)</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                 <div className="[&>div]:border-2 [&>div]:border-indigo-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-indigo-50/40">
                   <StatCard title="Students with Backlog" value={resultsData.backlogSnapshot.studentsWithBacklog} icon={Users} />
                 </div>
                 <div className="[&>div]:border-2 [&>div]:border-rose-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-rose-50/40">
                   <StatCard title="Active Backlogs" value={resultsData.backlogSnapshot.activeBacklogs} icon={AlertTriangle} contextType="danger" />
                 </div>
                 <div className="[&>div]:border-2 [&>div]:border-blue-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-blue-50/40">
                   <StatCard title="Subjects Affected" value={resultsData.backlogSnapshot.subjectsAffected} icon={BookOpen} />
                 </div>
                 <div className="[&>div]:border-2 [&>div]:border-amber-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-amber-50/40">
                   <StatCard title="Backlog Rate" value={`${(resultsData.backlogSnapshot.backlogRate || 0).toFixed(1)}%`} icon={XCircle} contextType="danger" />
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="rounded-3xl border-2 border-indigo-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
                   <ChartCard title="Students with Backlog vs No Active Backlog" description="Proportion of students with backlogs in this semester">
                     <ResponsiveContainer width="100%" height={300}>
                       <PieChart>
                         <Pie
                           data={[
                             { name: 'With Backlog', count: resultsData.backlogSnapshot.studentsWithBacklog },
                             { name: 'No Active Backlog', count: Math.max(0, resultsData.backlogSnapshot.totalScopedStudents - resultsData.backlogSnapshot.studentsWithBacklog) }
                           ]}
                           cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="count" nameKey="name" label
                         >
                           <Cell fill="#ef4444" />
                           <Cell fill="#10b981" />
                         </Pie>
                         <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                         <Legend verticalAlign="bottom" height={36} />
                       </PieChart>
                     </ResponsiveContainer>
                   </ChartCard>
                 </div>

                 <div className="rounded-3xl border-2 border-blue-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
                   <ChartCard title="Top 10 Backlog Subjects" description="Subjects with highest active backlogs">
                      <div style={{ height: 350, overflowY: 'auto', paddingRight: '10px' }}>
                        <ResponsiveContainer width="100%" height={Math.max(350, (resultsData.backlogSnapshot.topSubjects?.length || 0) * 50)}>
                          <BarChart data={resultsData.backlogSnapshot.topSubjects || []} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="subject" type="category" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={120} interval={0} />
                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} name="Active Backlogs" barSize={30}>
                              <LabelList dataKey="count" position="right" fill="#64748b" fontSize={12} fontWeight={500} formatter={(val: any) => val > 0 ? val : ''} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                   </ChartCard>
                 </div>
               </div>
             </div>
           )}
           
           {(trend.length > 1 || (resultsData?.backlogTrend && resultsData.backlogTrend.length > 0)) && (
            <div className="rounded-3xl border-2 border-indigo-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg mt-6">
              <ChartCard 
                title={trend.length > 1 ? "HISTORICAL UNIVERSITY PASS RATE" : "HISTORICAL BACKLOG RATE"} 
                description={trend.length > 1 ? "Overall pass percentage across all available semesters" : "Historical university results are not yet available for multiple semesters. The chart below shows the actual historical backlog rate instead."}
              >
                <ResponsiveContainer width="100%" height={350}>
                  {trend.length > 1 ? (
                    <LineChart data={trend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="semester" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Line type="monotone" dataKey="passRate" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} name="Pass Rate %" />
                    </LineChart>
                  ) : (
                    <LineChart data={resultsData.backlogTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="semester" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} content={<BacklogTrendTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="backlogRate" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8 }} name="Backlog Rate %" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </ChartCard>
            </div>
           )}
        </div>
      ) : (() => {
        const gradeOrder = ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F'];
        const sortedGradeDistribution = [...gradeDistribution].sort((a, b) => {
           const iA = gradeOrder.indexOf(a.grade);
           const iB = gradeOrder.indexOf(b.grade);
           return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB);
        });

        return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div className="[&>div]:border-2 [&>div]:border-indigo-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-indigo-50/40">
              <StatCard title="Students with Results" value={kpis?.studentsWithResults || 0} icon={Users} />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-blue-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-blue-50/40">
              <StatCard title="Subjects Evaluated" value={kpis?.subjectsEvaluated || 0} icon={BookOpen} />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-purple-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-purple-50/40">
              <StatCard title="Result Rows" value={kpis?.resultRows || 0} icon={FileText} />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-emerald-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-emerald-50/40">
              <StatCard title="Pass Rate" value={`${(kpis?.passRate || 0).toFixed(1)}%`} icon={CheckCircle} contextType="success" />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-rose-400 [&>div]:rounded-2xl [&>div]:shadow-md [&>div]:bg-rose-50/40">
              <StatCard title="Fail Rate" value={`${(kpis?.failRate || 0).toFixed(1)}%`} icon={XCircle} contextType="danger" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-3xl border-2 border-indigo-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="Overall Pass vs Fail" description="Distribution of passed and failed subjects">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                      label
                    >
                      {distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry._id === 'PASS' ? '#10b981' : '#ef4444'} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            
            <div className="lg:col-span-2 rounded-3xl border-2 border-blue-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
               <ChartCard title="Historical Pass Rate Trend" description="Overall pass percentage across all available semesters">
                 {trend.length <= 1 ? (
                    <div className="flex h-full items-center justify-center text-slate-500 text-sm py-12">Historical trend will appear after results are available for multiple semesters.</div>
                 ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="semester" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Line type="monotone" dataKey="passRate" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} name="Pass Rate %" />
                    </LineChart>
                  </ResponsiveContainer>
                 )}
               </ChartCard>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border-2 border-indigo-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="Subject-wise Performance" description="Sorted by Pass Percentage">
                <div style={{ height: 400, overflowY: 'auto', paddingRight: '10px' }}>
                  <ResponsiveContainer width="100%" height={Math.max(400, subjectDistribution.length * 50)}>
                    <BarChart data={subjectDistribution} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                      <RechartsTooltip content={<SubjectTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="pass" stackId="a" fill="#10b981" name="Pass" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="fail" stackId="a" fill="#ef4444" name="Fail" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
            
            <div className="rounded-3xl border-2 border-purple-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <ChartCard title="Grade Distribution" description="Grades obtained in this semester">
                {sortedGradeDistribution.length === 0 ? (
                   <div className="flex h-full items-center justify-center text-slate-500 py-12">Grade details unavailable.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={sortedGradeDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="grade" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Grade Frequency" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </div>
        </div>
        );
      })()}
    </>
  );
};