import { useEffect, useState } from "react";
import {
  StatCard,
  ChartCard,
  LoadingSkeleton,
  ErrorState,
  AcademicProfileHero,
} from "@/components/common";
import { analyticsService } from "@/services/analyticsService";
import { useAuth } from "@/providers/AuthProvider";
import { getAvatarUrl } from "@/utils/urlUtils";
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

const BRAND_PALETTE = ["#052659", "#5483B3", "#7DA0CA", "#C1E8FF", "#021024"];
const RISK_COLORS = { LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#ef4444" };

export const Dashboard = () => {
  const { user } = useAuth();
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

  return (
    <>
      {/* 1. Admin Academic Profile Hero Banner */}
      <AcademicProfileHero
        title="Admin Academic Profile"
        icon={Building}
        name={
          user?.fullName ||
          (user?.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user?.username || "System Administrator")
        }
        avatar={getAvatarUrl(user?.avatarFileId || user?.avatar)}
        fallbackText={(user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || user?.username?.charAt(0) || "A").toUpperCase()}
        badges={[
          { label: "Central System Administration" },
          { label: `Total Campuses: ${data?.kpis?.totalCampuses || 0}` },
          { label: "System Status: Online", highlight: true, dotColor: "bg-emerald-400" },
        ]}
        visionTitle="System Mandate"
        visionWords={["Control", "Manage", "Optimize"]}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Registered Campuses"
              value={data?.kpis?.totalCampuses ?? 0}
              icon={Building}
              contextType="neutral"
            />

            <StatCard
              title="Registered Subjects"
              value={data?.kpis?.totalSubjects ?? 0}
              icon={BookOpen}
              contextType="neutral"
            />

            <StatCard
              title="Active Users"
              value={data?.kpis?.activeUsers ?? 0}
              icon={Users}
              contextType="neutral"
            />

            <StatCard
              title="Total Students"
              value={data?.kpis?.totalStudents ?? 0}
              icon={GraduationCap}
              contextType="neutral"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Students by Branch"
              description="Enrollment totals across academic branches"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.studentsByBranch}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="adminBranchGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0090FF" stopOpacity={0.95} />
                        <stop offset="60%" stopColor="#0A3670" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#052659" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="branchCode" tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "1px solid #7DA0CA40", boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)" }} />
                    <Bar
                      dataKey="count"
                      fill="url(#adminBranchGrad)"
                      radius={[6, 6, 0, 0]}
                      name="Students"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Students by Year"
              description="Enrollment totals across cohorts"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.studentsByYear}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="adminYearGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5483B3" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#052659" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "1px solid #7DA0CA40", boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)" }} />
                    <Bar
                      dataKey="count"
                      fill="url(#adminYearGrad)"
                      radius={[6, 6, 0, 0]}
                      name="Students"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Users by Role"
              description="System user distribution by permission tier"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.usersByRole || []}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={4}
                    >
                      {(data?.usersByRole || []).map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={BRAND_PALETTE[index % BRAND_PALETTE.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "1px solid #7DA0CA40", boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)", backgroundColor: "#ffffff" }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Institution Risk Distribution"
              description="Academic backlog risk distribution system-wide"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.riskDistribution || []}
                      dataKey="count"
                      nameKey="level"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={4}
                    >
                      {(data?.riskDistribution || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={RISK_COLORS[entry.level] || "#7DA0CA"}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "1px solid #7DA0CA40", boxShadow: "0 6px 16px -2px rgb(0 0 0 / 0.08)", backgroundColor: "#ffffff" }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      ) : null}
    </>
  );
};
