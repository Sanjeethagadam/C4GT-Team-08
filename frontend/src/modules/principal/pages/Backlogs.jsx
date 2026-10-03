import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  ChartCard,
  StatCard,
} from "@/components/common";
import { analyticsService } from "@/services/analyticsService";
import { AlertCircle, Users, CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SubjectTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-lg max-w-xs">
        <p className="font-medium text-slate-800 mb-1">{label}</p>
        <p className="text-sm font-bold text-violet-600">
          Active Backlog Subjects: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export const Backlogs = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [backlogs] = await Promise.all([
        analyticsService.getBacklogsDistribution(),
      ]);

      const activeBacklogSubjects = backlogs.activeBacklogSubjects;
      const totalEver = backlogs.totalEver;
      const cleared = totalEver - activeBacklogSubjects;

      const uniqueStudentsWithBacklogs = backlogs.studentsWithActiveBacklogs;

      const branchDist =
        backlogs.branchDist?.map((b) => ({ name: b._id, value: b.count })) ||
        [];
      const subjectDist =
        backlogs.subjectDist
          ?.map((s) => ({ name: s._id, value: s.count }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
          .reverse() || [];
      const semesterDist =
        backlogs.semesterDist?.map((s) => ({
          name: s.semester,
          active: s.active,
          cleared: s.cleared,
        })) || [];
      const statusDist =
        backlogs.statusDist?.map((s) => ({ name: s.name, value: s.count })) ||
        [];

      const yearsPerf = await analyticsService.getYearsPerformance();
      const yearDist = yearsPerf.map((y) => ({
        name: y.name,
        value: y.activeBacklogs || 0,
      }));

      setData({
        activeBacklogSubjects,
        uniqueStudentsWithBacklogs,
        clearedBacklogs: cleared,
        branchDist,
        subjectDist,
        semesterDist,
        statusDist,
        yearDist,
      });
    } catch (err) {
      setError(err.message || "Failed to load backlog data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const truncateText = (text, length) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  return (
    <>
      <PageHeader
        title="Backlog Analysis"
        description="Detailed breakdown and monitoring of student backlogs."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Active Backlog Subjects"
              value={data.activeBacklogSubjects.toString()}
              icon={AlertCircle}
              contextType="danger"
              contextLine="Current Institution Wide"
            />

            <StatCard
              title="Students With Active Backlogs"
              value={data.uniqueStudentsWithBacklogs.toString()}
              icon={Users}
              contextType="warning"
              contextLine="At least 1 active backlog"
            />

            <StatCard
              title="Cleared Backlogs"
              value={data.clearedBacklogs.toString()}
              icon={CheckCircle2}
              contextType="success"
              contextLine="Historical clears"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Backlogs by Branch"
              description="Active backlogs distributed across branches"
            >
              {data.branchDist.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-slate-500">
                  No backlog data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={data.branchDist}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="pBranchBacklogGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0090FF" stopOpacity={0.95} />
                        <stop offset="60%" stopColor="#0A3670" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#052659" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #7DA0CA40",
                        boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#pBranchBacklogGrad)"
                      radius={[6, 6, 0, 0]}
                      name="Active Backlogs"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Backlogs by Year"
              description="Active backlogs distributed across cohorts"
            >
              {data.yearDist.every((y) => y.value === 0) ? (
                <div className="flex h-[260px] items-center justify-center text-slate-500">
                  No backlog data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={data.yearDist}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="pYearBacklogGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5483B3" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#052659" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #7DA0CA40",
                        boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#pYearBacklogGrad)"
                      radius={[6, 6, 0, 0]}
                      name="Active Backlogs"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Top Subjects with Backlogs"
              description="Subjects with the highest active backlog counts"
            >
              {data.subjectDist.length === 0 ? (
                <div className="flex h-[450px] items-center justify-center text-slate-500">
                  No backlog data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart
                    data={data.subjectDist}
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    layout="vertical"
                  >
                    <defs>
                      <linearGradient id="pSubjBacklogGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#052659" />
                        <stop offset="100%" stopColor="#0090FF" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={220}
                      tickFormatter={(val) => truncateText(val, 30)}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<SubjectTooltip />}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#pSubjBacklogGrad)"
                      radius={[0, 6, 6, 0]}
                      name="Active Backlogs"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Active vs Cleared (By Semester)"
              description="Status of backlogs across semesters"
            >
              {data.semesterDist.length === 0 ? (
                <div className="flex h-[260px] items-center justify-center text-slate-500">
                  No backlog data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={data.semesterDist}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="pSemActiveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0090FF" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#052659" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="pSemClearedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#065f46" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #7DA0CA40",
                        boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="active"
                      stackId="a"
                      fill="url(#pSemActiveGrad)"
                      name="Active"
                    />
                    <Bar
                      dataKey="cleared"
                      stackId="a"
                      fill="url(#pSemClearedGrad)"
                      name="Cleared"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </div>
      ) : null}
    </>
  );
};
