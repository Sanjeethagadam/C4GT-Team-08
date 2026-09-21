import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { branchService, type Branch } from '@/services/branchService';
import { analyticsService } from '@/services/analyticsService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap } from 'lucide-react'; // Icon import chesam

export const Branches = () => {
  const [data, setData] = useState<any[]>([]);
  const [metric, setMetric] = useState<string>('Students');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const branches = await branchService.getAllBranches();
      
      const branchPromises = branches.map(async (branch: Branch) => {
        const [kpis, results, backlogs, risk] = await Promise.all([
          analyticsService.getCampusKPIs({ branchId: branch._id }),
          analyticsService.getResultsDistribution({ branchId: branch._id }),
          analyticsService.getBacklogsDistribution({ branchId: branch._id }),
          analyticsService.getRiskDistribution({ branchId: branch._id })
        ]);

        const mediumRisk = risk.find((r: any) => r.level === 'MEDIUM')?.count || 0;
        const highRisk = risk.find((r: any) => r.level === 'HIGH')?.count || 0;
        const atRisk = mediumRisk + highRisk;

        const passRateRaw = results?.kpis?.passRate;
        const hasPassRate = results?.status !== 'NOT_AVAILABLE' && results?.status !== 'HISTORICAL_NOT_IMPORTED' && results?.status !== 'NOT_ANNOUNCED' && passRateRaw !== undefined;

        const shortName = branch.code || branch.name.replace(/Artificial Intelligence and/g, 'AI &').replace(/Computer Science/g, 'CS');

        return {
          name: branch.name,
          shortName: shortName,
          'Students': kpis.totalStudents,
          'Active Backlog Subjects': backlogs.activeBacklogSubjects,
          'At-Risk Students': atRisk,
          'Pass %': hasPassRate ? parseFloat(passRateRaw.toFixed(1)) : null,
        };
      });

      const branchData = await Promise.all(branchPromises);
      setData(branchData);
    } catch (err: any) {
      setError(err.message || 'Failed to load branch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      let displayVal = val;
      if (val === 'Not Available') displayVal = 'Not Available';
      else if (metric === 'Pass %') displayVal = `${val}%`;

      const fullItem = data.find(d => d.shortName === label || d.name === label);
      const fullName = fullItem ? fullItem.name : label;

      return (
        <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-lg">
          <p className="font-medium text-slate-800 mb-1">{fullName}</p>
          <p className="text-sm" style={{ color: payload[0].stroke }}>
            {metric}: <span className="font-bold">{displayVal}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const isDataEmpty = () => {
    if (data.length === 0) return true;
    return data.every(item => item[metric] === 0 || item[metric] === null);
  };

  const hasPassData = data.some(row => row['Pass %'] !== null && row['Pass %'] !== undefined);
  
  return (
    <>
      <PageHeader 
        title="Branch Comparison" 
        description="Compare academic and backlog performance across the 5 branches."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <div className="space-y-6">
          {/* Top selection area with icon and persistent border highlight */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md border-2 border-indigo-400 shadow-md shadow-indigo-100 rounded-xl px-4 py-2">
              <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
              <label className="text-sm font-semibold text-indigo-900">Metric:</label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-[180px] bg-transparent border-none shadow-none focus:ring-0 font-medium text-slate-800">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Students">Students</SelectItem>
                  <SelectItem value="Active Backlog Subjects">Active Backlog Subjects</SelectItem>
                  <SelectItem value="At-Risk Students">At-Risk Students</SelectItem>
                  {hasPassData && <SelectItem value="Pass %">Pass %</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Branch</th>
                    <th className="px-6 py-4 font-medium text-right">Students</th>
                    <th className="px-6 py-4 font-medium text-right">At-Risk Students</th>
                    {hasPassData && <th className="px-6 py-4 font-medium text-right">Pass %</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                      <td className="px-6 py-4 text-right">{row['Students']}</td>
                      <td className="px-6 py-4 text-right">{row['At-Risk Students']}</td>
                      {hasPassData && <td className="px-6 py-4 text-right">{row['Pass %'] !== null && row['Pass %'] !== undefined ? `${row['Pass %']}%` : '-'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ChartCard title={`${metric} by Branch`} description={`Comparison of ${metric.toLowerCase()} across all branches (Area Trend View)`}>
            {isDataEmpty() ? (
              <div className="flex h-full items-center justify-center text-slate-500 text-lg font-medium">
                {metric === 'Pass %' ? `No ${metric.toLowerCase()} data available yet.` : `No data available for ${metric}.`}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} 
                    interval={0}
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '15px' }} />
                  <Area 
                    type="monotone" 
                    dataKey={metric} 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMetric)" 
                    name={metric} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </>
  );
};