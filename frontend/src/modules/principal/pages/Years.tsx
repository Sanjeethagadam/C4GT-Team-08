import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Sparkles } from 'lucide-react';

export const Years = () => {
  const [data, setData] = useState<any[]>([]);
  const [metric, setMetric] = useState<string>('Students');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const yearsToCompare = [2, 3, 4];
      
      const yearPromises = yearsToCompare.map(async (year: number) => {
        const [kpis, results, backlogs, risk, trends] = await Promise.all([
          analyticsService.getCampusKPIs({ year }),
          analyticsService.getResultsDistribution({ year }),
          analyticsService.getBacklogsDistribution({ year }),
          analyticsService.getRiskDistribution({ year }),
          analyticsService.getAcademicTrends({ year })
        ]);

        const mediumRisk = risk.find((r: any) => r.level === 'MEDIUM')?.count || 0;
        const highRisk = risk.find((r: any) => r.level === 'HIGH')?.count || 0;
        const atRisk = mediumRisk + highRisk;

        const passRateRaw = results?.kpis?.passRate;
        const avgMarksRaw = trends?.kpis?.averageMarks;

        const hasPassRate = results?.status !== 'NOT_AVAILABLE' && results?.status !== 'HISTORICAL_NOT_IMPORTED' && results?.status !== 'NOT_ANNOUNCED' && passRateRaw !== undefined;

        return {
          name: `Year ${year}`,
          'Students': kpis.totalStudents || 0,
          'Active Backlog Subjects': backlogs.activeBacklogSubjects || 0,
          'At-Risk Students': atRisk,
          'Pass %': hasPassRate ? parseFloat(passRateRaw.toFixed(1)) : 0,
          'Average Marks': avgMarksRaw !== undefined && avgMarksRaw !== null ? parseFloat(avgMarksRaw.toFixed(1)) : 0
        };
      });

      const yearData = await Promise.all(yearPromises);
      setData(yearData);
    } catch (err: any) {
      setError(err.message || 'Failed to load year comparison data');
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
      if (metric === 'Pass %' || metric === 'Average Marks') displayVal = `${val}%`;

      return (
        <div className="bg-slate-900/95 backdrop-blur-xl text-white p-3.5 border border-indigo-500/30 shadow-2xl rounded-2xl">
          <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{label} Cohort</span>
          </div>
          <p className="text-sm font-medium text-slate-200">
            {metric}: <span className="font-bold text-white text-base ml-1">{displayVal}</span>
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
  const hasAvgMarksData = data.some(row => row['Average Marks'] !== null && row['Average Marks'] !== undefined);

  // Soft theme-matching strokes and colors
  const BAR_STROKES = ['#4f46e5', '#0284c7', '#0d9488'];

  return (
    <>
      <PageHeader 
        title="Academic Year Comparison" 
        description="Compare academic and backlog performance across Year 2, Year 3, and Year 4 cohorts."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <div className="space-y-6">
          {/* Top selection area with icon and rich border highlight */}
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
                  {hasAvgMarksData && <SelectItem value="Average Marks">Average Marks</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clean Static Chart Card without inner wrapper box borders */}
          <ChartCard title={`${metric} Distribution by Academic Year`} description={`Comparative breakdown of ${metric.toLowerCase()} across academic cohorts`}>
            {isDataEmpty() ? (
              <div className="flex h-[380px] items-center justify-center text-slate-500 text-lg font-medium">
                {metric === 'Pass %' || metric === 'Average Marks' ? `No ${metric.toLowerCase()} data available yet.` : `No data available for ${metric}.`}
              </div>
            ) : (
              <div className="h-[400px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 35, right: 30, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="themeGrad0" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.85}/>
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="themeGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.85}/>
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="themeGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.85}/>
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#334155', fontSize: 14, fontWeight: 700 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
                    <Bar 
                      dataKey={metric} 
                      radius={[12, 12, 0, 0]} 
                      barSize={65}
                      strokeWidth={2}
                    >
                      {data.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#themeGrad${index % 3})`} 
                          stroke={BAR_STROKES[index % BAR_STROKES.length]} 
                        />
                      ))}
                      <LabelList 
                        dataKey={metric} 
                        position="top" 
                        style={{ fill: '#1e293b', fontSize: 13, fontWeight: 'bold' }} 
                        formatter={(val: any) => (metric === 'Pass %' || metric === 'Average Marks' ? `${val}%` : val)}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
      )}
    </>
  );
};