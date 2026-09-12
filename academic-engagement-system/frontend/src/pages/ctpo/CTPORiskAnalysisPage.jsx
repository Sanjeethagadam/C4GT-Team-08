import React, { useState, useEffect } from "react";
import { getRiskAnalysis } from "../../api/riskAnalysis.api";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  Users,
  Award,
  BookOpen,
  Filter,
  BarChart3,
  Layers,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

export const CTPORiskAnalysisPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState("ALL");

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRiskAnalysis();
      const payload = res.data || res;
      if (payload) {
        setData(payload);
      } else {
        throw new Error(res.message || "Failed to load risk analysis");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  if (loading) return <LoadingState message="Calculating branch risk metrics and statistics from database..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAnalysis} />;

  if (!data || Object.keys(data).length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No risk analysis data available."
        description="There are currently no risk metrics computed for this branch in the database."
      />
    );
  }

  const {
    branch,
    year,
    metrics = {},
    riskDistribution = {},
    subjectPerformance = [],
    mid1 = {},
    mid2 = {},
    semesterWiseBacklogs = [],
    studentsByRisk = {},
    students = [],
  } = data;

  const mid1Performance = mid1.subjectPerformance || [];
  const mid2Performance = mid2.subjectPerformance || [];

  // Flatten students list by risk
  const allRiskStudents = students.length > 0 ? students : [
    ...(studentsByRisk.HIGH || []),
    ...(studentsByRisk.MEDIUM || []),
    ...(studentsByRisk.LOW || []),
  ];

  const filteredStudents = allRiskStudents.filter((s) => {
    if (selectedRiskFilter === "ALL") return true;
    return s.riskLevel === selectedRiskFilter;
  });

  const highRiskCount = riskDistribution.HIGH ?? metrics.highRiskStudents ?? 0;
  const mediumRiskCount = riskDistribution.MEDIUM ?? metrics.mediumRiskStudents ?? 0;
  const lowRiskCount = riskDistribution.LOW ?? metrics.lowRiskStudents ?? 0;
  const totalStudents = metrics.totalStudents ?? data.totalStudents ?? 0;
  const withBacklogs = metrics.studentsWithBacklogs ?? data.studentsWithBacklogs ?? 0;
  const withoutBacklogs = metrics.studentsWithoutBacklogs ?? data.studentsWithoutBacklogs ?? Math.max(0, totalStudents - withBacklogs);

  const hasMid1Chart = mid1Performance.length > 0;
  const hasMid2Chart = mid2Performance.length > 0;
  const hasSemesterBacklogs = semesterWiseBacklogs.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            Branch Risk & Performance Analysis
          </h1>
          <p className="text-sm sm:text-[15px] text-slate-500 mt-0.5">
            Internal assessment performance metrics and failure risk classification strictly for {branch?.code} ({branch?.name}) Year {year || 4}
          </p>
        </div>
        <Badge variant="academic" size="md">
          Branch: {branch?.code || "Branch"} &bull; Year {year || 4}
        </Badge>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle={`${withBacklogs} with backlogs • ${withoutBacklogs} clear`}
          icon={Users}
          variant="academic"
        />
        <StatCard
          title="Evaluated in Mids"
          value={`${metrics.evaluatedStudents ?? 0} / ${totalStudents}`}
          subtitle={`${metrics.studentsWithMidFailures ?? 0} students with mid fails`}
          icon={Award}
          variant="sky"
        />
        <StatCard
          title="High Risk (≥2 Fails)"
          value={highRiskCount}
          subtitle={`${mediumRiskCount} Medium • ${lowRiskCount} Low Risk`}
          icon={AlertTriangle}
          variant={highRiskCount > 0 ? "rose" : "emerald"}
        />
        <StatCard
          title="Branch Average Score"
          value={metrics.averageBranchMarks !== undefined ? `${metrics.averageBranchMarks} / 30` : "No data available"}
          subtitle="Mean score across evaluated mid marks"
          icon={BarChart3}
          variant="purple"
        />
      </div>

      {/* Risk Level Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-[13px] font-semibold uppercase tracking-wider text-rose-600">High Risk Students</p>
            <h3 className="text-2xl sm:text-[28px] font-bold text-rose-800 mt-1">{highRiskCount}</h3>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">≥2 internal failures or multiple backlogs</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-[13px] font-semibold uppercase tracking-wider text-amber-600">Medium Risk Students</p>
            <h3 className="text-2xl sm:text-[28px] font-bold text-amber-800 mt-1">{mediumRiskCount}</h3>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">1 internal failure or border passing score</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-[13px] font-semibold uppercase tracking-wider text-emerald-600">Low Risk Students</p>
            <h3 className="text-2xl sm:text-[28px] font-bold text-emerald-800 mt-1">{lowRiskCount}</h3>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">Consistent passing performance</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts (Render ONLY when real data exists) */}
      {(hasMid1Chart || hasMid2Chart || hasSemesterBacklogs) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MID-1 Performance Chart */}
          {hasMid1Chart && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  MID-1 Subject Average Scores (Max: 30)
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500">Real evaluated scores by enrolled subject</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mid1Performance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="code"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 30]}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                        fontSize: "13px",
                      }}
                    />
                    <Bar dataKey="averageMarks" name="Avg Score" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* MID-2 Performance Chart */}
          {hasMid2Chart && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  MID-2 Subject Average Scores (Max: 30)
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500">Real evaluated scores by enrolled subject</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mid2Performance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="code"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 30]}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                        fontSize: "13px",
                      }}
                    />
                    <Bar dataKey="averageMarks" name="Avg Score" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Semester-Wise Backlog Count Chart */}
          {hasSemesterBacklogs && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4 lg:col-span-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  Semester-Wise Backlog Distribution
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500">Total active backlog papers across terms</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={semesterWiseBacklogs} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="semester"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                        fontSize: "13px",
                      }}
                    />
                    <Bar dataKey="backlogCount" name="Backlogs" fill="#dc2626" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Students At Risk Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Students At Risk Roster
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Filtered student records based on academic risk levels
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-academic-500/20 cursor-pointer"
            >
              <option value="ALL">All Risk Levels ({allRiskStudents.length})</option>
              <option value="HIGH">High Risk ({highRiskCount})</option>
              <option value="MEDIUM">Medium Risk ({mediumRiskCount})</option>
              <option value="LOW">Low Risk ({lowRiskCount})</option>
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No students found matching the selected risk criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm sm:text-[15px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-sm font-semibold text-slate-600">
                  <th className="py-3.5 px-4 sm:px-6">Roll Number</th>
                  <th className="py-3.5 px-4 sm:px-6">Student Name</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Backlogs</th>
                  <th className="py-3.5 px-4">Mid Fails</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s, idx) => {
                  const rollNo = s.rollNo || s.rollNumber || "N/A";
                  const riskLvl = s.riskLevel || (s.midFailCount >= 2 ? "HIGH" : s.midFailCount === 1 ? "MEDIUM" : "LOW");
                  const backlogs = s.backlogCount ?? s.backlogs?.count ?? 0;
                  const midFails = s.midFailCount ?? s.failedSubjectsCount ?? 0;

                  return (
                    <tr key={s._id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900">
                        {rollNo}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800">
                        {s.name || "Student"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        Section {s.section || s.sectionId?.name || "A"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {backlogs}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {midFails}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Badge
                          variant={riskLvl === "HIGH" ? "danger" : riskLvl === "MEDIUM" ? "warning" : "success"}
                          size="md"
                        >
                          {riskLvl} RISK
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CTPORiskAnalysisPage;
