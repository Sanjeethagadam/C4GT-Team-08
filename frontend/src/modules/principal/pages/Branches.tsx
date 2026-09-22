import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Branches = () => {
  const [data, setData] = useState<any[]>([]);
  const [metric, setMetric] = useState<string>('Students');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const branchPerformanceData = await analyticsService.getBranchesPerformance();
      
      const formattedData = branchPerformanceData.map((branchStats: any) => {
        let shortName = branchStats.name;
        if (shortName === 'Artificial Intelligence and Machine Learning') shortName = 'AI & ML';
        else if (shortName === 'Artificial Intelligence and Data Science') shortName = 'AI & Data Science';
        else if (shortName === 'Artificial Intelligence') shortName = 'AI';

        return {
          name: branchStats.name,
          shortName: shortName,
          'Students': branchStats.students,
          'Active Backlog Subjects': branchStats.activeBacklogs,
          'At-Risk Students': branchStats.atRisk,
          'Pass %': branchStats.passRate !== null ? branchStats.passRate : null
        };
      });

      setData(formattedData);
    } catch (err: any) {
      setError(err.message || 'Failed to load branch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const fullRow = payload[0].payload;
      let displayVal = val;
      if (val === 'Not Available') displayVal = 'Not Available';
      else if (metric === 'Pass %') displayVal = `${val}%`;

      return (
        <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-lg">
          <p className="font-medium text-slate-800 mb-1">{fullRow.name}</p>
          <p className="text-sm" style={{ color: payload[0].fill }}>
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

  // When rendering the chart, Recharts ignores non-numeric values for Bar
  // So 'Not Available' will just render as an empty bar.
  
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
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-600">Metric:</label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-[180px] bg-white">
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
                    <th className="px-6 py-4 font-medium text-right">Active Backlogs</th>
                    <th className="px-6 py-4 font-medium text-right">At-Risk Students</th>
                    {hasPassData && <th className="px-6 py-4 font-medium text-right">Pass %</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                      <td className="px-6 py-4 text-right">{row['Students']}</td>
                      <td className="px-6 py-4 text-right">{row['Active Backlog Subjects']}</td>
                      <td className="px-6 py-4 text-right">{row['At-Risk Students']}</td>
                      {hasPassData && <td className="px-6 py-4 text-right">{row['Pass %'] !== null && row['Pass %'] !== undefined ? `${row['Pass %']}%` : '-'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ChartCard title={`${metric} by Branch`} description={`Comparison of ${metric.toLowerCase()} across all branches`}>
            {isDataEmpty() ? (
              <div className="flex h-full items-center justify-center text-slate-500 text-lg font-medium">
                {metric === 'Pass %' ? `No ${metric.toLowerCase()} data available yet.` : `No data available for ${metric}.`}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="shortName" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey={metric} fill="#3b82f6" radius={[4, 4, 0, 0]} name={metric} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </>
  );
};
