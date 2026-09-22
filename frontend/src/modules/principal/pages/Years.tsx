import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ChartCard } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Years = () => {
  const [data, setData] = useState<any[]>([]);
  const [metric, setMetric] = useState<string>('Students');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const yearPerformanceData = await analyticsService.getYearsPerformance();
      
      const formattedData = yearPerformanceData.map((yearStats: any) => {
        return {
          name: yearStats.name,
          'Students': yearStats.students,
          'Active Backlog Subjects': yearStats.activeBacklogs,
          'At-Risk Students': yearStats.atRisk,
          'Pass %': yearStats.passRate !== null ? yearStats.passRate : null,
          'Average Marks': yearStats.averageMarks !== null ? yearStats.averageMarks : null
        };
      });

      setData(formattedData);
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
      if (val === 'Not Available') displayVal = 'Not Available';
      else if (metric === 'Pass %' || metric === 'Average Marks') displayVal = `${val}%`;

      return (
        <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-lg">
          <p className="font-medium text-slate-800 mb-1">{label}</p>
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
  const hasAvgMarksData = data.some(row => row['Average Marks'] !== null && row['Average Marks'] !== undefined);

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
                  {hasAvgMarksData && <SelectItem value="Average Marks">Average Marks</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ChartCard title={`${metric} by Academic Year`} description={`Comparison of ${metric.toLowerCase()} across cohorts`}>
            {isDataEmpty() ? (
              <div className="flex h-[350px] items-center justify-center text-slate-500 text-lg font-medium">
                {metric === 'Pass %' || metric === 'Average Marks' ? `No ${metric.toLowerCase()} data available yet.` : `No data available for ${metric}.`}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey={metric} fill="#6366f1" radius={[4, 4, 0, 0]} name={metric} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </>
  );
};
