import { useEffect, useState } from "react";
import {
  PageHeader,
  StatCard,
  LoadingSkeleton,
  ErrorState,
} from "@/components/common";
import { analyticsService } from "@/services/analyticsService";
import { Users, Building, BookOpen, GraduationCap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dashboardData = await analyticsService.getAdminDashboard();
        setData(dashboardData);
      } catch (err) {
        setError(err.message || "Failed to load system stats");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const COLORS = [
    "#0ea5e9",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];
  const RISK_COLORS = { LOW: "#22c55e", MEDIUM: "#f59e0b", HIGH: "#ef4444" };

  return (
    <>
      <PageHeader
        title="System Dashboard"
        description="Overview of system configuration and health."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : data ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Registered Campuses"
              value={data.kpis.totalCampuses}
              icon={Building}
              colorVariant="purple"
            />

            <StatCard
              title="Registered Subjects"
              value={data.kpis.totalSubjects}
              icon={BookOpen}
              colorVariant="sky"
            />

            <StatCard
              title="Active Users"
              value={data.kpis.activeUsers}
              icon={Users}
              colorVariant="mint"
            />

            <StatCard
              title="Total Students"
              value={data.kpis.totalStudents}
              icon={GraduationCap}
              colorVariant="cyan"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden bg-white rounded-2xl border border-[#E9D5FF] shadow-[0_1px_3px_rgba(124,58,237,0.04)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.10)] transition-all duration-200">
              <div className="px-6 py-4 bg-gradient-to-r from-[#F5F3FF] via-[#FAF8FF] to-white border-b border-[#E9D5FF]/70 flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Students by Branch</h3>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.studentsByBranch}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branchCode" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar
                        dataKey="count"
                        fill="#7C3AED"
                        radius={[4, 4, 0, 0]}
                        name="Students"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white rounded-2xl border border-[#E9D5FF] shadow-[0_1px_3px_rgba(124,58,237,0.04)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.10)] transition-all duration-200">
              <div className="px-6 py-4 bg-gradient-to-r from-[#F5F3FF] via-[#FAF8FF] to-white border-b border-[#E9D5FF]/70 flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Students by Year</h3>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.studentsByYear}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar
                        dataKey="count"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        name="Students"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden bg-white rounded-2xl border border-[#E9D5FF] shadow-[0_1px_3px_rgba(124,58,237,0.04)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.10)] transition-all duration-200">
              <div className="px-6 py-4 bg-gradient-to-r from-[#F5F3FF] via-[#FAF8FF] to-white border-b border-[#E9D5FF]/70 flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Users by Role</h3>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.usersByRole}
                        dataKey="count"
                        nameKey="role"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {data.usersByRole.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white rounded-2xl border border-[#E9D5FF] shadow-[0_1px_3px_rgba(124,58,237,0.04)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.10)] transition-all duration-200">
              <div className="px-6 py-4 bg-gradient-to-r from-[#F5F3FF] via-[#FAF8FF] to-white border-b border-[#E9D5FF]/70 flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                  Institution Risk Distribution
                </h3>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.riskDistribution}
                        dataKey="count"
                        nameKey="level"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {data.riskDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={RISK_COLORS[entry.level] || "#ccc"}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
