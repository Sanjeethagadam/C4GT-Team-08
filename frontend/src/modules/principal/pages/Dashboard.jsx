import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  ChartCard,
  StatCard,
} from "@/components/common";
import { analyticsService } from "@/services/analyticsService";
import { Users, AlertTriangle, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [kpis, , backlogs, risk] = await Promise.all([
        analyticsService.getCampusKPIs(),
        analyticsService.getResultsDistribution(),
        analyticsService.getBacklogsDistribution(),
        analyticsService.getRiskDistribution(),
        analyticsService.getAcademicTrends(),
      ]);

      const lowRisk = risk.find((r) => r.level === "LOW")?.count || 0;
      const mediumRisk = risk.find((r) => r.level === "MEDIUM")?.count || 0;
      const highRisk = risk.find((r) => r.level === "HIGH")?.count || 0;
      const atRisk = mediumRisk + highRisk;

      const riskData = [
        { name: "Low Risk", value: lowRisk, color: "#10b981" },
        { name: "Medium Risk", value: mediumRisk, color: "#f59e0b" },
        { name: "High Risk", value: highRisk, color: "#ef4444" },
      ];

      // Reformat backlog branch dist
      const backlogBranches =
        backlogs.branchDist?.map((b) => ({ name: b._id, value: b.count })) ||
        [];

      // Reformat student branch dist (this data comes from kpis.studentBranches)
      const studentBranches =
        kpis.studentBranches?.map((b) => ({
          name: b.branchCode,
          value: b.count,
        })) || [];
      // Reformat student year dist
      const yearsMap = { 2: 0, 3: 0, 4: 0 };
      kpis.studentYears?.forEach((y) => {
        if (yearsMap[y.year] !== undefined) yearsMap[y.year] = y.count;
      });
      const studentYears = [
        { name: "Year 2", value: yearsMap[2] },
        { name: "Year 3", value: yearsMap[3] },
        { name: "Year 4", value: yearsMap[4] },
      ];

      setData({
        totalStudents: kpis.totalStudents,
        activeUsers: kpis.activeUsers,
        activeBacklogSubjects: backlogs.activeBacklogSubjects,
        studentsWithActiveBacklogs: backlogs.studentsWithActiveBacklogs,
        atRisk,
        riskData,
        backlogBranches,
        studentBranches,
        studentYears,
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <PageHeader
        title="Institution Dashboard"
        description="High-level institution-wide academic and performance summary."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : data ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate("/principal/drill-down")}
              className="cursor-pointer transition-transform hover:-translate-y-1"
            >
              <StatCard
                title="Total Students"
                value={data.totalStudents.toString()}
                icon={Users}
                contextLine="Institution Wide"
                colorVariant="purple"
              />
            </div>
            <div>
              <StatCard
                title="Active Users"
                value={data.activeUsers?.toString() || "0"}
                icon={Users}
                contextType="success"
                contextLine="Currently Online"
                colorVariant="mint"
              />
            </div>
            <div
              onClick={() => navigate("/principal/backlogs")}
              className="cursor-pointer transition-transform hover:-translate-y-1"
            >
              <StatCard
                title="Active Backlog Subjects"
                value={data.activeBacklogSubjects.toString()}
                icon={AlertCircle}
                contextType="danger"
                contextLine="Institution Wide"
                colorVariant="amber"
              />
            </div>
            <div
              onClick={() => navigate("/principal/risk")}
              className="cursor-pointer transition-transform hover:-translate-y-1"
            >
              <StatCard
                title="At-Risk Students"
                value={data.atRisk.toString()}
                icon={AlertTriangle}
                contextType="warning"
                contextLine="Institution Wide"
                colorVariant="rose"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students by Branch */}
            <div
              onClick={() => navigate("/principal/branches")}
              className="cursor-pointer transition-transform hover:-translate-y-1"
            >
              <ChartCard
                title="Students by Branch"
                description="Distribution of students across all branches"
              >
                {data.studentBranches.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    No student data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={data.studentBranches}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
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
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#7C3AED"
                        radius={[4, 4, 0, 0]}
                        name="Students"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Students by Year */}
            <div
              onClick={() => navigate("/principal/years")}
              className="cursor-pointer transition-transform hover:-translate-y-1"
            >
              <ChartCard
                title="Students by Year"
                description="Distribution of active students across cohorts"
              >
                {data.studentYears.every((y) => y.value === 0) ? (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    No student data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={data.studentYears}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
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
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#8B5CF6"
                        radius={[4, 4, 0, 0]}
                        name="Students"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Backlogs by Branch */}
            <div
              onClick={() => navigate("/principal/backlogs")}
              className="cursor-pointer transition-transform hover:-translate-y-1"
            >
              <ChartCard
                title="Active Backlogs by Branch"
                description="Current backlog counts across branches"
              >
                {data.backlogBranches.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    No backlog data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={data.backlogBranches}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
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
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#f43f5e"
                        radius={[4, 4, 0, 0]}
                        name="Backlogs"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Risk Distribution */}
            <div
              onClick={() => navigate("/principal/risk")}
              className="cursor-pointer transition-transform hover:-translate-y-1"
            >
              <ChartCard
                title="Risk Distribution"
                description="Institution-wide active backlog risk distribution"
              >
                {data.riskData.every((r) => r.value === 0) ? (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    No risk data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
