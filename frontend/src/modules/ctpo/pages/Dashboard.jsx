import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  StatCard,
  ChartCard,
  LoadingSkeleton,
  ErrorState,
  AcademicProfileHero,
} from "@/components/common";
import { ctpoService } from "@/services/ctpoService";
import { useAuth } from "@/providers/AuthProvider";
import { Users, AlertTriangle, BookOpen, GraduationCap } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAvatarUrl } from "@/utils/urlUtils";

const COLORS = {
  LOW: "#10b981", // emerald-500
  MEDIUM: "#f59e0b", // amber-500
  HIGH: "#ef4444", // red-500
  "AT-RISK": "#dc2626", // red-600
};

import { useActiveAcademicSession } from "@/hooks/useActiveAcademicSession";

export const CtpoDashboard = () => {
  const { user } = useAuth();
  const activeSessionString = useActiveAcademicSession();
  const scopeYear = user?.scope?.year;
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ctpoService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard metrics",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!metrics) return null;

  const riskDist = metrics.riskDistribution || {};
  const riskPieData = [
    {
      name: "Low Risk (0-1)",
      value: riskDist.low || 0,
      color: COLORS.LOW,
    },
    {
      name: "Medium Risk (2-4)",
      value: riskDist.medium || 0,
      color: COLORS.MEDIUM,
    },
    {
      name: "High Risk (5+)",
      value: riskDist.high || 0,
      color: COLORS.HIGH,
    },
  ].filter((d) => d.value > 0);

  const riskBarData = [
    { name: "Low", students: riskDist.low || 0 },
    { name: "Medium", students: riskDist.medium || 0 },
    { name: "High", students: riskDist.high || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. CTPO Academic Profile Hero Banner */}
      <AcademicProfileHero
        title="CTPO Academic Profile"
        icon={Users}
        name={
          user?.fullName ||
          (user?.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user?.username || "Class Teacher & Placement Officer")
        }
        avatar={getAvatarUrl(user?.avatarFileId || user?.avatar)}
        fallbackText={(user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || user?.username?.charAt(0) || "C").toUpperCase()}
        badges={[
          { label: scopeYear ? `Supervising / Year: Year ${scopeYear}` : "Class Coordinator & Placement" },
          { label: `Enrolled: ${metrics.totalStudents || 0} Students` },
          { label: `Academic Session ${activeSessionString}`, highlight: true, dotColor: "bg-emerald-400" },
        ]}
        visionTitle="CTPO Mandate"
        visionWords={["Mentor", "Guide", "Place"]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => navigate("/ctpo/students")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="Total Students"
            value={metrics.totalStudents}
            icon={Users}
          />
        </div>
        <div
          onClick={() => navigate("/ctpo/students?backlog=WITH")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="Students With Active Backlogs"
            value={metrics.studentsWithActiveBacklogs}
            icon={BookOpen}
            contextType={
              metrics.studentsWithActiveBacklogs > 0 ? "warning" : "success"
            }
          />
        </div>
        <StatCard
          title="Active Backlog Subjects"
          value={metrics.activeBacklogSubjects}
          icon={AlertTriangle}
          contextType={metrics.activeBacklogSubjects > 0 ? "danger" : "success"}
        />

        <div
          onClick={() => navigate("/ctpo/students?risk=AT-RISK")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="At-Risk Students"
            value={riskDist.atRisk || 0}
            icon={GraduationCap}
            contextType={
              (riskDist.atRisk || 0) > 0 ? "danger" : "success"
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Risk Distribution"
          description="Distribution of students across risk levels"
        >
          {riskPieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500">
              No risk data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Risk by Category"
          description="Student counts by risk tier"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={riskBarData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="ctpoRiskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0090FF" stopOpacity={0.95} />
                    <stop offset="60%" stopColor="#0A3670" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#052659" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar
                  dataKey="students"
                  name="Students"
                  fill="url(#ctpoRiskGradient)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
