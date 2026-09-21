import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageHeader,
  StatCard,
  LoadingSkeleton,
  ErrorState,
} from "@/components/common";
import { ctpoService } from "@/services/ctpoService";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = {
  LOW: "#10b981", // emerald-500
  MEDIUM: "#f59e0b", // amber-500
  HIGH: "#ef4444", // red-500
  "AT-RISK": "#dc2626", // red-600
};

export const CtpoDashboard = () => {
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

  const riskPieData = [
    {
      name: "Low Risk (0-1)",
      value: metrics.riskDistribution.low,
      color: COLORS.LOW,
    },
    {
      name: "Medium Risk (2-4)",
      value: metrics.riskDistribution.medium,
      color: COLORS.MEDIUM,
    },
    {
      name: "High Risk (5+)",
      value: metrics.riskDistribution.high,
      color: COLORS.HIGH,
    },
  ].filter((d) => d.value > 0);

  const riskBarData = [
    { name: "Low", students: metrics.riskDistribution.low },
    { name: "Medium", students: metrics.riskDistribution.medium },
    { name: "High", students: metrics.riskDistribution.high },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Dashboard"
        description="Overview of your assigned class academic standing and risk distribution."
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
            colorVariant="purple"
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
            colorVariant="amber"
            contextType={
              metrics.studentsWithActiveBacklogs > 0 ? "warning" : "success"
            }
          />
        </div>
        <StatCard
          title="Active Backlog Subjects"
          value={metrics.activeBacklogSubjects}
          icon={AlertTriangle}
          colorVariant="rose"
          contextType={metrics.activeBacklogSubjects > 0 ? "danger" : "success"}
        />

        <div
          onClick={() => navigate("/ctpo/students?risk=AT-RISK")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="At-Risk Students"
            value={metrics.riskDistribution.atRisk}
            icon={GraduationCap}
            colorVariant="rose"
            contextType={
              metrics.riskDistribution.atRisk > 0 ? "danger" : "success"
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="relative overflow-hidden group rounded-2xl border border-[#E9D5FF] shadow-[0_1px_3px_rgba(124,58,237,0.04)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.10)] transition-all duration-200">
          <CardHeader className="px-6 py-4 bg-gradient-to-r from-[#F5F3FF] via-[#FAF8FF] to-white border-b border-[#E9D5FF]/70">
            <CardTitle className="text-base font-bold text-[#0F172A] tracking-tight">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group rounded-2xl border border-[#E9D5FF] shadow-[0_1px_3px_rgba(124,58,237,0.04)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.10)] transition-all duration-200">
          <CardHeader className="px-6 py-4 bg-gradient-to-r from-[#F5F3FF] via-[#FAF8FF] to-white border-b border-[#E9D5FF]/70">
            <CardTitle className="text-base font-bold text-[#0F172A] tracking-tight">Risk by Category</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={riskBarData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="students" name="Students" radius={[4, 4, 0, 0]}>
                    {riskBarData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name.toUpperCase()] || "#94a3b8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
