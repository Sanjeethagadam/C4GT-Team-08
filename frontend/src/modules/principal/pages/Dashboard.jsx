import { useEffect, useState } from "react";
import {
  LoadingSkeleton,
  ErrorState,
  ChartCard,
  StatCard,
  AcademicProfileHero,
} from "@/components/common";
import { useAuth } from "@/providers/AuthProvider";
import { getAvatarUrl } from "@/utils/urlUtils";
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

import { useActiveAcademicSession } from "@/hooks/useActiveAcademicSession";

export const Dashboard = () => {
  const { user } = useAuth();
  const activeSessionString = useActiveAcademicSession();
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

      const riskList = Array.isArray(risk)
        ? risk
        : Array.isArray(risk?.distribution)
          ? risk.distribution
          : [];
      const lowRisk = riskList.find((r) => r.level === "LOW")?.count || 0;
      const mediumRisk = riskList.find((r) => r.level === "MEDIUM")?.count || 0;
      const highRisk = riskList.find((r) => r.level === "HIGH")?.count || 0;
      const atRisk = mediumRisk + highRisk;

      const riskData = [
        { name: "Low Risk", value: lowRisk, color: "#10b981" },
        { name: "Medium Risk", value: mediumRisk, color: "#f59e0b" },
        { name: "High Risk", value: highRisk, color: "#ef4444" },
      ];

      // Reformat backlog branch dist
      const backlogBranches =
        backlogs?.branchDist?.map((b) => ({ name: b._id, value: b.count })) ||
        [];

      // Reformat student branch dist (this data comes from kpis.studentBranches)
      const studentBranches =
        kpis?.studentBranches?.map((b) => ({
          name: b.branchCode,
          value: b.count,
        })) || [];
      // Reformat student year dist
      const yearsMap = { 2: 0, 3: 0, 4: 0 };
      kpis?.studentYears?.forEach((y) => {
        if (yearsMap[y.year] !== undefined) yearsMap[y.year] = y.count;
      });
      const studentYears = [
        { name: "Year 2", value: yearsMap[2] },
        { name: "Year 3", value: yearsMap[3] },
        { name: "Year 4", value: yearsMap[4] },
      ];

      setData({
        totalStudents: kpis?.totalStudents || 0,
        activeUsers: kpis?.activeUsers || 0,
        activeBacklogSubjects: backlogs?.activeBacklogSubjects || 0,
        studentsWithActiveBacklogs: backlogs?.studentsWithActiveBacklogs || 0,
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
      {/* 1. Principal Academic Profile Hero Banner */}
      <AcademicProfileHero
        title="Principal Academic Profile"
        icon={Users}
        name={
          user?.fullName ||
          (user?.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user?.username || "Principal & Executive Director")
        }
        avatar={getAvatarUrl(user?.avatarFileId || user?.avatar)}
        fallbackText={(user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || user?.username?.charAt(0) || "P").toUpperCase()}
        badges={[
          { label: "Institution Executive Leadership" },
          { label: `Campus Strength: ${data?.totalStudents || 0} Students` },
          { label: `Academic Session ${activeSessionString}`, highlight: true, dotColor: "bg-emerald-400" },
        ]}
        visionTitle="Institutional Vision"
        visionWords={["Govern", "Elevate", "Achieve"]}
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
              />
            </div>
            <div>
              <StatCard
                title="Active Users"
                value={data.activeUsers?.toString() || "0"}
                icon={Users}
                contextType="success"
                contextLine="Currently Online"
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students by Branch — Gradient Bar Presentation */}
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
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={data.studentBranches}
                      margin={{ top: 20, right: 25, left: -10, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="branchGradient" x1="0" y1="0" x2="0" y2="1">
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
                        tick={{ fill: "#64748b", fontSize: 11.5 }}
                        interval={0}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 11.5 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #7DA0CA40",
                          boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)",
                          backgroundColor: "#ffffff",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="url(#branchGradient)"
                        radius={[6, 6, 0, 0]}
                        name="Students"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Students by Year — Vertical Bar Chart */}
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
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={data.studentYears}
                      margin={{ top: 20, right: 25, left: -10, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
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
                        tick={{ fill: "#64748b", fontSize: 11.5 }}
                        interval={0}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 11.5 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #7DA0CA40",
                          boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)",
                          backgroundColor: "#ffffff",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="url(#yearGradient)"
                        radius={[6, 6, 0, 0]}
                        name="Students"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Backlogs by Branch — Horizontal Bar Chart Presentation */}
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
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      layout="vertical"
                      data={data.backlogBranches}
                      margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="backlogGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#052659" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#5483B3" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        type="number"
                        tick={{ fill: "#64748b", fontSize: 11.5 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={80}
                        tick={{ fill: "#64748b", fontSize: 11.5 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #7DA0CA40",
                          boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)",
                          backgroundColor: "#ffffff",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="url(#backlogGradient)"
                        radius={[0, 6, 6, 0]}
                        name="Backlogs"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Risk Distribution — Approved Doughnut Distribution */}
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
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data.riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data.riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #7DA0CA40",
                          boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)",
                          backgroundColor: "#ffffff",
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
