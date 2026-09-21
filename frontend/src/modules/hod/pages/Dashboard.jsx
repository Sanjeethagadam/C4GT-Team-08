import { useEffect, useState } from "react";
import {
  PageHeader,
  StatCard,
  LoadingSkeleton,
  ErrorState,
  ChartCard,
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

export const Dashboard = () => {
  const { user } = useAuth();
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
      <PageHeader
        title={
          scopeYear
            ? `Department Dashboard — Year ${scopeYear}`
            : "Department Dashboard"
        }
        description="High-level overview of department performance and KPIs."
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
              colorVariant="purple"
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
              colorVariant="sky"
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3 text-right">Students</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kpis?.studentBranches?.map((b) => (
                      <tr
                        key={b.branchCode}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {b.branchName} ({b.branchCode})
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {b.count}
                        </td>
                      </tr>
                    ))}
                    {(!kpis?.studentBranches ||
                      kpis.studentBranches.length === 0) && (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {kpis?.studentBranches && kpis.studentBranches.length > 0 && (
                    <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                      <tr>
                        <td className="px-4 py-3 text-slate-800">Total</td>
                        <td className="px-4 py-3 text-right text-slate-800">
                          {kpis.totalStudents}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Branch Distribution (Backlogs)"
              description="Active backlogs per branch"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3 text-right">Backlogs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kpis?.backlogBranches?.map((b) => (
                      <tr
                        key={b.branchCode}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {b.branchName} ({b.branchCode})
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {b.count}
                        </td>
                      </tr>
                    ))}
                    {(!kpis?.backlogBranches ||
                      kpis.backlogBranches.length === 0) && (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {kpis?.backlogBranches && kpis.backlogBranches.length > 0 && (
                    <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                      <tr>
                        <td className="px-4 py-3 text-slate-800">Total</td>
                        <td className="px-4 py-3 text-right text-slate-800">
                          {kpis.totalBacklogs}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
};
