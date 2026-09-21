import { useEffect, useState } from 'react';
import { PageHeader, StatCard, LoadingSkeleton, ErrorState } from '@/components/common';
import { HODFilterBar } from '../components/HODFilterBar';
import { analyticsService, type AnalyticsFilters, type CampusKPIs } from '@/services/analyticsService';
import { Users, BookOpen, AlertTriangle, GraduationCap, ShieldAlert, BarChart3, Layers } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export const Dashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  
  const [kpis, setKpis] = useState<CampusKPIs | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (currentFilters: AnalyticsFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const [kpiData, trendsData, riskDistData] = await Promise.all([
        analyticsService.getCampusKPIs(currentFilters),
        analyticsService.getAcademicTrends(currentFilters),
        analyticsService.getRiskDistribution(currentFilters)
      ]);
      
      setKpis(kpiData);
      setTrends(Array.isArray(trendsData) ? trendsData : (trendsData?.trends || []));
      setRiskData(Array.isArray(riskDistData) ? riskDistData : (riskDistData?.distribution || riskDistData?.data || []));
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadData(filters);
    }
  }, [filters]);

  const handleFilterChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };
  
  const lowRisk = riskData.find(r => r.level === 'LOW')?.count || 0;
  const mediumRisk = riskData.find(r => r.level === 'MEDIUM')?.count || 0;
  const highRisk = riskData.find(r => r.level === 'HIGH')?.count || 0;
  const atRiskCount = mediumRisk + highRisk;
  const totalRiskStudents = lowRisk + mediumRisk + highRisk;

  const lowRiskPct = totalRiskStudents > 0 ? Math.round((lowRisk / totalRiskStudents) * 100) : 0;
  const medRiskPct = totalRiskStudents > 0 ? Math.round((mediumRisk / totalRiskStudents) * 100) : 0;
  const highRiskPct = totalRiskStudents > 0 ? Math.round((highRisk / totalRiskStudents) * 100) : 0;
  
  const scopeYear = (user as any)?.scope?.year;

  return (
    <>
      <PageHeader 
        title={scopeYear ? `Department Dashboard — Year ${scopeYear}` : "Department Dashboard"} 
        description="High-level overview of department performance and KPIs."
      />
      
      {/* Direct Highlight for Year and Branch Selection Dropdown Boxes */}
      <div className="mb-6 [&_select]:border-2 [&_select]:border-indigo-500 [&_select]:bg-indigo-50/40 [&_select]:rounded-xl [&_select]:shadow-sm [&_select]:font-semibold">
        <HODFilterBar onFilterChange={handleFilterChange} />
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
      ) : (
        <div className="space-y-6">
          {/* Highlighted Stat Cards with custom outlines and background accents */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="[&>div]:border-2 [&>div]:border-slate-300 [&>div]:rounded-2xl [&>div]:shadow-sm">
              <StatCard 
                title="Total Students" 
                value={kpis?.totalStudents || 0} 
                icon={Users}
                contextLine="Enrolled Students"
              />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-indigo-400 [&>div]:rounded-2xl [&>div]:shadow-sm [&>div]:bg-indigo-50/50">
              <StatCard 
                title="Avg Marks" 
                value={trends.length > 0 ? (trends.reduce((a, b) => a + b.averageMarks, 0) / trends.length).toFixed(1) : 'N/A'} 
                icon={BookOpen}
                contextLine="Overall Academic Average"
              />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-amber-400 [&>div]:rounded-2xl [&>div]:shadow-sm [&>div]:bg-amber-50/50">
              <StatCard 
                title="Active Backlog Subjects" 
                value={kpis?.activeBacklogSubjects || 0} 
                icon={AlertTriangle}
                contextType={kpis?.activeBacklogSubjects && kpis.activeBacklogSubjects > 0 ? "warning" : "success"}
                contextLine="Needs Monitoring"
              />
            </div>
            <div className="[&>div]:border-2 [&>div]:border-rose-400 [&>div]:rounded-2xl [&>div]:shadow-sm [&>div]:bg-rose-50/50">
              <StatCard 
                title="At-Risk Students" 
                value={atRiskCount} 
                icon={GraduationCap}
                contextType={atRiskCount > 0 ? "danger" : "success"}
                contextLine="Medium & High Risk"
              />
            </div>
          </div>

          {/* First Row: Highlighted Risk Breakdown and Branch Students Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Risk Distribution Card */}
            <div className="rounded-3xl border-2 border-indigo-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-blue-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
                <div>
                  <h3 className="text-slate-900 font-bold text-base flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-600" />
                    Risk Distribution Breakdown
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Active backlogs: Low (0-1), Medium (2-4), High (5+)</p>
                </div>
                <span className="p-2 rounded-xl bg-indigo-100/80 text-indigo-700">
                  <BarChart3 className="w-4 h-4" />
                </span>
              </div>
              <div className="p-6">
                {totalRiskStudents === 0 ? (
                  <div className="flex h-[240px] items-center justify-center text-slate-500 font-medium">No risk records available.</div>
                ) : (
                  <div className="space-y-5">
                    {/* Low Risk */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-700 flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
                          Low Risk (0-1 Backlogs)
                        </span>
                        <span className="text-slate-900 font-bold">{lowRisk} <span className="text-slate-400 font-normal">({lowRiskPct}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${lowRiskPct}%` }}></div>
                      </div>
                    </div>

                    {/* Medium Risk */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-700 flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block shadow-sm"></span>
                          Medium Risk (2-4 Backlogs)
                        </span>
                        <span className="text-slate-900 font-bold">{mediumRisk} <span className="text-slate-400 font-normal">({medRiskPct}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${medRiskPct}%` }}></div>
                      </div>
                    </div>

                    {/* High Risk */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-700 flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block shadow-sm"></span>
                          High Risk (5+ Backlogs)
                        </span>
                        <span className="text-slate-900 font-bold">{highRisk} <span className="text-slate-400 font-normal">({highRiskPct}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
                        <div className="bg-gradient-to-r from-rose-500 to-pink-400 h-full rounded-full transition-all duration-500" style={{ width: `${highRiskPct}%` }}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-amber-500" /> Department Risk Analysis</span>
                      <span>Total Evaluated: {totalRiskStudents}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Branch Distribution Students Card */}
            <div className="rounded-3xl border-2 border-blue-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                <div>
                  <h3 className="text-slate-900 font-bold text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Branch Distribution (Students)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Number of students per branch</p>
                </div>
                <span className="p-2 rounded-xl bg-blue-100/80 text-blue-700">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <div className="p-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Branch</th>
                        <th className="px-4 py-3 text-right">Students</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {kpis?.studentBranches?.map((b) => (
                        <tr key={b.branchCode} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-700">{b.branchName} ({b.branchCode})</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">{b.count}</td>
                        </tr>
                      ))}
                      {(!kpis?.studentBranches || kpis.studentBranches.length === 0) && (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-slate-500">No data available</td>
                        </tr>
                      )}
                    </tbody>
                    {kpis?.studentBranches && kpis.studentBranches.length > 0 && (
                      <tfoot className="bg-blue-50/60 font-bold border-t border-blue-100">
                        <tr>
                          <td className="px-4 py-3 text-slate-800">Total Enrolled</td>
                          <td className="px-4 py-3 text-right text-blue-600">{kpis.totalStudents}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>

          </div>
          
          {/* Second Row: Highlighted Branch Distribution (Backlogs) Card */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="rounded-3xl border-2 border-rose-200 bg-white shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-gradient-to-r from-rose-50 via-slate-50 to-amber-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
                <div>
                  <h3 className="text-slate-900 font-bold text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    Branch Distribution (Backlogs)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Active backlogs per branch overview</p>
                </div>
                <span className="p-2 rounded-xl bg-rose-100/80 text-rose-700">
                  <BarChart3 className="w-4 h-4" />
                </span>
              </div>
              <div className="p-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Branch</th>
                        <th className="px-4 py-3 text-right">Backlogs Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {kpis?.backlogBranches?.map((b) => (
                        <tr key={b.branchCode} className="hover:bg-rose-50/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-700">{b.branchName} ({b.branchCode})</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">{b.count}</td>
                        </tr>
                      ))}
                      {(!kpis?.backlogBranches || kpis.backlogBranches.length === 0) && (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-slate-500">No data available</td>
                        </tr>
                      )}
                    </tbody>
                    {kpis?.backlogBranches && kpis.backlogBranches.length > 0 && (
                      <tfoot className="bg-rose-50/60 font-bold border-t border-rose-100">
                        <tr>
                          <td className="px-4 py-3 text-slate-800">Total Backlogs Recorded</td>
                          <td className="px-4 py-3 text-right text-rose-600">{kpis.totalBacklogs}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </>
  );
};