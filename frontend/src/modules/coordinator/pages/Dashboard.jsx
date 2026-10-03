import { useEffect, useState } from "react";
import {
  StatCard,
  LoadingSkeleton,
  ErrorState,
  ChartCard,
  AcademicProfileHero,
} from "@/components/common";
import { analyticsService } from "@/services/analyticsService";
import { useAuth } from "@/providers/AuthProvider";
import { AlertTriangle, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAvatarUrl } from "@/utils/urlUtils";

import { useActiveAcademicSession } from "@/hooks/useActiveAcademicSession";

export const Dashboard = () => {
  const { user } = useAuth();
  const activeSessionString = useActiveAcademicSession();
  const [remedialStats, setRemedialStats] = useState([]);
  const [guestStats, setGuestStats] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [remedials, guests, kpiData] = await Promise.all([
          analyticsService.getRemedialStats(),
          analyticsService.getGuestLectureStats(),
          analyticsService.getCampusKPIs(),
        ]);
        setRemedialStats(remedials || []);
        setGuestStats(guests || []);
        setKpis(kpiData || null);
      } catch (err) {
        setError(err.message || "Failed to load coordinator data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getCountByStatus = (stats, status) => {
    if (!Array.isArray(stats)) return 0;
    const item = stats.find((s) => s._id === status);
    return item ? item.count : 0;
  };

  const formatBranchData = () => {
    if (!kpis?.backlogBranches || !Array.isArray(kpis.backlogBranches)) return [];
    return kpis.backlogBranches.map((b) => ({
      name: b.branchCode,
      Count: b.count,
    }));
  };

  const formatYearData = () => {
    if (!kpis?.backlogYears || !Array.isArray(kpis.backlogYears)) return [];
    return kpis.backlogYears.map((y) => ({
      name: `Year ${y.year}`,
      Count: y.count,
    }));
  };

  return (
    <>
      {/* 1. Coordinator Academic Profile Hero Banner */}
      <AcademicProfileHero
        title="Coordinator Academic Profile"
        icon={Users}
        name={
          user?.fullName ||
          (user?.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user?.username || "Academic Support Coordinator")
        }
        avatar={getAvatarUrl(user?.avatarFileId || user?.avatar)}
        fallbackText={(user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || user?.username?.charAt(0) || "C").toUpperCase()}
        badges={[
          { label: "Academic Support & Remedial Coordination" },
          { label: `Enrolled: ${kpis?.totalStudents || 0} Students` },
          { label: `Academic Session ${activeSessionString}`, highlight: true, dotColor: "bg-emerald-400" },
        ]}
        visionTitle="Coordination Goal"
        visionWords={["Support", "Remedy", "Progress"]}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <StatCard
              title="Total Students"
              value={kpis?.totalStudents || 0}
              icon={Users}
            />

            <StatCard
              title="Active Backlog Students"
              value={kpis?.studentsWithActiveBacklogs || 0}
              icon={AlertTriangle}
              contextType={
                (kpis?.studentsWithActiveBacklogs || 0) > 0
                  ? "warning"
                  : "success"
              }
            />

            <StatCard
              title="Active Backlog Subjects"
              value={kpis?.activeBacklogSubjects || 0}
              icon={AlertTriangle}
              contextType={
                (kpis?.activeBacklogSubjects || 0) > 0 ? "warning" : "success"
              }
            />

            <StatCard
              title="Scheduled Remedial Classes"
              value={getCountByStatus(remedialStats, "SCHEDULED")}
              icon={AlertTriangle}
            />

            <StatCard
              title="Scheduled Guest Lectures"
              value={getCountByStatus(guestStats, "SCHEDULED")}
              icon={AlertTriangle}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard
              title="Active Backlog Students by Year"
              description="Distribution across academic years"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={formatYearData()}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="coordYearGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <Bar dataKey="Count" fill="url(#coordYearGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Active Backlog Students by Branch"
              description="Distribution across branches"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={formatBranchData()}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="coordBranchGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <Bar dataKey="Count" fill="url(#coordBranchGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
};
