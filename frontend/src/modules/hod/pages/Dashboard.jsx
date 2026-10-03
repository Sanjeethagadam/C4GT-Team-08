import { useEffect, useState } from "react";
import {
  StatCard,
  LoadingSkeleton,
  ErrorState,
  ChartCard,
  AcademicProfileHero,
} from "@/components/common";
import { HODFilterBar } from "../components/HODFilterBar";
import { analyticsService } from "@/services/analyticsService";
import { Users, BookOpen, AlertTriangle, GraduationCap } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuth } from "@/providers/AuthProvider";
import { getAvatarUrl } from "@/utils/urlUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useActiveAcademicSession } from "@/hooks/useActiveAcademicSession";

export const Dashboard = () => {
  const { user } = useAuth();
  const activeSessionString = useActiveAcademicSession();
  const [filters, setFilters] = useState({});
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async (currentFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const [kpiData, trendsData, riskDistData] = await Promise.all([
        analyticsService.getCampusKPIs(currentFilters),
        analyticsService.getAcademicTrends(currentFilters),
        analyticsService.getRiskDistribution(currentFilters),
      ]);
      setKpis(kpiData);
      setTrends(
        Array.isArray(trendsData) ? trendsData : trendsData?.trends || [],
      );
      setRiskData(
        Array.isArray(riskDistData)
          ? riskDistData
          : riskDistData?.distribution || riskDistData?.data || [],
      );
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadData(filters);
    }
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  const mediumRisk = riskData.find((r) => r.level === "MEDIUM")?.count || 0;
  const highRisk = riskData.find((r) => r.level === "HIGH")?.count || 0;
  const atRiskCount = mediumRisk + highRisk;
  const scopeYear = user?.scope?.year;

  const RISK_COLORS = {
    LOW: "#10b981",
    MEDIUM: "#f59e0b",
    HIGH: "#ef4444",
  };

  return (
    <>
      {/* 1. HOD Academic Profile Hero Banner */}
      <AcademicProfileHero
        title="HOD Academic Profile"
        icon={GraduationCap}
        name={
          user?.fullName ||
          (user?.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user?.username || "Head of Department")
        }
        avatar={getAvatarUrl(user?.avatarFileId || user?.avatar)}
        fallbackText={(user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || user?.username?.charAt(0) || "H").toUpperCase()}
        badges={[
          { label: "Department Executive Leadership" },
          { label: scopeYear ? `Supervising: Year ${scopeYear}` : "All Department Cohorts" },
          { label: `Academic Session ${activeSessionString}`, highlight: true, dotColor: "bg-emerald-400" },
        ]}
        visionTitle="Department Vision"
        visionWords={["Lead", "Innovate", "Excel"]}
      />

      <HODFilterBar onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(filters)} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={kpis?.totalStudents || 0}
              icon={Users}
            />

            <StatCard
              title="Avg Marks"
              value={
                trends.length > 0
                  ? (
                      trends.reduce((a, b) => a + b.averageMarks, 0) /
                      trends.length
                    ).toFixed(1)
                  : "N/A"
              }
              icon={BookOpen}
            />

            <StatCard
              title="Active Backlog Subjects"
              value={kpis?.activeBacklogSubjects || 0}
              icon={AlertTriangle}
              contextType={
                kpis?.activeBacklogSubjects && kpis.activeBacklogSubjects > 0
                  ? "warning"
                  : "success"
              }
            />

            <StatCard
              title="At-Risk Students"
              value={atRiskCount}
              icon={GraduationCap}
              contextType={atRiskCount > 0 ? "danger" : "success"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Risk Distribution"
              description="Active backlogs: Low (0-1), Medium (2-4), High (5+)"
            >
              {riskData.length === 0 ||
              riskData.reduce((a, b) => a + b.count, 0) === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500">
                  No risk records available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="level"
                      label
                    >
                      {riskData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={RISK_COLORS[entry.level]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Branch Distribution (Students)"
              description="Number of students per branch"
            >
              <div className="border border-[#7DA0CA]/30 rounded-xl overflow-hidden shadow-2xs">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-[#052659] via-[#083375] to-[#052659] border-b border-[#052659]">
                    <TableRow className="hover:bg-transparent border-0">
                      <TableHead className="text-white font-extrabold text-[11px] uppercase tracking-wider py-2.5">Branch</TableHead>
                      <TableHead className="text-right text-white font-extrabold text-[11px] uppercase tracking-wider py-2.5">Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpis?.studentBranches?.map((b) => (
                      <TableRow key={b.branchCode} className="hover:bg-[#C1E8FF]/20 odd:bg-white even:bg-[#f8fbfe]/80 transition-colors border-b border-[#7DA0CA]/15 last:border-0">
                        <TableCell className="font-semibold text-xs text-[#021024] py-2.5">
                          {b.branchName} ({b.branchCode})
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold text-[#052659] py-2.5">
                          {b.count}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!kpis?.studentBranches ||
                      kpis.studentBranches.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="py-8 text-center text-xs text-muted-foreground"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  {kpis?.studentBranches && kpis.studentBranches.length > 0 && (
                    <TableFooter className="bg-[#f0f7fc]/80 border-t border-[#7DA0CA]/30">
                      <TableRow>
                        <TableCell className="font-extrabold text-xs text-[#021024]">Total</TableCell>
                        <TableCell className="text-right font-extrabold text-xs text-[#052659]">
                          {kpis.totalStudents}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Branch Distribution (Backlogs)"
              description="Active backlogs per branch"
            >
              <div className="border border-[#7DA0CA]/30 rounded-xl overflow-hidden shadow-2xs">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-[#052659] via-[#083375] to-[#052659] border-b border-[#052659]">
                    <TableRow className="hover:bg-transparent border-0">
                      <TableHead className="text-white font-extrabold text-[11px] uppercase tracking-wider py-2.5">Branch</TableHead>
                      <TableHead className="text-right text-white font-extrabold text-[11px] uppercase tracking-wider py-2.5">Backlogs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpis?.backlogBranches?.map((b) => (
                      <TableRow key={b.branchCode} className="hover:bg-[#C1E8FF]/20 odd:bg-white even:bg-[#f8fbfe]/80 transition-colors border-b border-[#7DA0CA]/15 last:border-0">
                        <TableCell className="font-semibold text-xs text-[#021024] py-2.5">
                          {b.branchName} ({b.branchCode})
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold text-rose-700 py-2.5">
                          {b.count}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!kpis?.backlogBranches ||
                      kpis.backlogBranches.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="py-8 text-center text-xs text-muted-foreground"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  {kpis?.backlogBranches && kpis.backlogBranches.length > 0 && (
                    <TableFooter className="bg-[#f0f7fc]/80 border-t border-[#7DA0CA]/30">
                      <TableRow>
                        <TableCell className="font-extrabold text-xs text-[#021024]">Total</TableCell>
                        <TableCell className="text-right font-extrabold text-xs text-rose-700">
                          {kpis.totalBacklogs}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
};
