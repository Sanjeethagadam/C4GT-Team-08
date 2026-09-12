import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../../api/dashboard.api";
import { StatCard } from "../../components/common/StatCard";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { Badge } from "../../components/common/Badge";
import {
  Users,
  Award,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Building2,
  FileCheck,
  CheckCircle2,
} from "lucide-react";

export const CTPODashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardData();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || "Failed to load dashboard metrics");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading CTPO branch dashboard metrics from database..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  const {
    branch,
    year,
    studentsSummary = {},
    backlogsSummary = {},
    midMarksSummary = {},
    timetablesSummary = {},
    riskAnalysis = {},
  } = data;

  const totalStudents = studentsSummary.totalStudents !== undefined ? studentsSummary.totalStudents : null;
  const studentsWithBacklogs = backlogsSummary.studentsWithBacklogs !== undefined ? backlogsSummary.studentsWithBacklogs : null;
  const totalBacklogs = backlogsSummary.totalBacklogs !== undefined ? backlogsSummary.totalBacklogs : null;
  const evaluatedCount = midMarksSummary.evaluatedStudentsCount !== undefined ? midMarksSummary.evaluatedStudentsCount : null;
  const pendingCount = midMarksSummary.pendingEvaluationCount !== undefined ? midMarksSummary.pendingEvaluationCount : null;
  const totalTimetables = timetablesSummary.totalTimetables !== undefined ? timetablesSummary.totalTimetables : null;

  const highRisk = riskAnalysis.riskDistribution?.HIGH ?? 0;
  const mediumRisk = riskAnalysis.riskDistribution?.MEDIUM ?? 0;
  const lowRisk = riskAnalysis.riskDistribution?.LOW ?? 0;

  return (
    <div className="space-y-6">
      {/* Light Professional Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="academic" size="md">
              <Building2 className="w-4 h-4 text-academic-600" />
              <span>{branch?.code || "Branch"} Department Scope</span>
            </Badge>
            <Badge variant="neutral" size="md">
              <span>Year {year || 4} Academic Scope</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
            {branch?.name || "Department"} CTPO Dashboard
          </h1>
          <p className="text-sm sm:text-[15px] text-slate-500 max-w-2xl leading-relaxed font-normal">
            Live branch-wise student management, continuous mid evaluation tracking, and failure risk analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Link
            to="/ctpo/mid-marks"
            className="academic-button-primary px-4.5 py-2.5"
          >
            <Award className="w-4 h-4" />
            <span>Enter Mid Marks</span>
          </Link>
          <Link
            to="/ctpo/timetable"
            className="academic-button-secondary px-4.5 py-2.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Upload Timetable</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents !== null ? totalStudents : "No data available"}
          subtitle={`Year ${year || 4} in ${branch?.code || "Branch"}`}
          icon={Users}
          variant="academic"
          action={
            <Link to="/ctpo/students" className="text-[13px] sm:text-sm text-academic-700 hover:text-academic-900 flex items-center gap-1 font-semibold">
              View student list <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <StatCard
          title="Students With Backlogs"
          value={studentsWithBacklogs !== null ? studentsWithBacklogs : "No data available"}
          subtitle={totalBacklogs !== null ? `${totalBacklogs} total backlogs` : undefined}
          icon={BookOpen}
          variant={studentsWithBacklogs && studentsWithBacklogs > 0 ? "rose" : "emerald"}
          action={
            <Link to="/ctpo/students" className="text-[13px] sm:text-sm text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold">
              View backlogs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <StatCard
          title="Evaluated in Mids"
          value={evaluatedCount !== null && totalStudents !== null ? `${evaluatedCount} / ${totalStudents}` : "No data available"}
          subtitle={pendingCount !== null ? `${pendingCount} pending evaluations` : undefined}
          icon={Award}
          variant="sky"
          action={
            <Link to="/ctpo/mid-marks" className="text-[13px] sm:text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1 font-semibold">
              Manage marks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <StatCard
          title="Active Timetables"
          value={totalTimetables !== null ? totalTimetables : "No data available"}
          subtitle="Mid & semester schedules"
          icon={Calendar}
          variant="purple"
          action={
            <Link to="/ctpo/timetable" className="text-[13px] sm:text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 font-semibold">
              View schedules <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Quick Actions</h2>
          <p className="text-[13px] sm:text-sm text-slate-500 mt-0.5">Direct access to core academic operations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            to="/ctpo/students"
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-academic-50 border border-academic-200/80 text-academic-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-[15px] font-semibold text-slate-900 group-hover:text-academic-700 transition-colors">
                View Students
              </p>
              <p className="text-[13px] text-slate-500">Branch student directory</p>
            </div>
          </Link>

          <Link
            to="/ctpo/mid-marks"
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-[15px] font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                Enter Mid Marks
              </p>
              <p className="text-[13px] text-slate-500">MID-1 & MID-2 entry</p>
            </div>
          </Link>

          <Link
            to="/ctpo/timetable"
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-[15px] font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                Upload Timetable
              </p>
              <p className="text-[13px] text-slate-500">Publish class & mid schedules</p>
            </div>
          </Link>

          <Link
            to="/ctpo/risk-analysis"
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-[15px] font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                Risk Analysis
              </p>
              <p className="text-[13px] text-slate-500">Failure risk analytics</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Academic Overview & Risk Summary (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Academic Risk Distribution</h2>
              <p className="text-[13px] text-slate-500">Categorized by failure count</p>
            </div>
            <Link
              to="/ctpo/risk-analysis"
              className="text-[13px] sm:text-sm font-semibold text-academic-700 hover:underline flex items-center gap-1"
            >
              Full Analysis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">High Risk</p>
              <p className="text-2xl sm:text-[28px] font-bold text-rose-800 mt-1">{highRisk}</p>
              <p className="text-xs text-rose-500 mt-0.5">≥2 Failures</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Medium Risk</p>
              <p className="text-2xl sm:text-[28px] font-bold text-amber-800 mt-1">{mediumRisk}</p>
              <p className="text-xs text-amber-500 mt-0.5">1 Failure</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Low Risk</p>
              <p className="text-2xl sm:text-[28px] font-bold text-emerald-800 mt-1">{lowRisk}</p>
              <p className="text-xs text-emerald-500 mt-0.5">0 Failures</p>
            </div>
          </div>
        </div>

        {/* Timetable & Mid Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Branch Academic Overview</h2>
              <p className="text-[13px] text-slate-500">Current semester schedule status</p>
            </div>
            <Badge variant="academic" size="md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Scope</span>
            </Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4.5 h-4.5 text-academic-600" />
                <span className="font-semibold text-slate-700">Uploaded Schedules</span>
              </div>
              <span className="font-bold text-slate-900">
                {totalTimetables !== null ? `${totalTimetables} Schedules` : "No data available"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Award className="w-4.5 h-4.5 text-sky-600" />
                <span className="font-semibold text-slate-700">Evaluation Coverage</span>
              </div>
              <span className="font-bold text-slate-900">
                {evaluatedCount !== null && totalStudents !== null && totalStudents > 0
                  ? `${Math.round((evaluatedCount / totalStudents) * 100)}% Complete`
                  : "No data available"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4.5 h-4.5 text-amber-600" />
                <span className="font-semibold text-slate-700">Backlog Clearance Ratio</span>
              </div>
              <span className="font-bold text-slate-900">
                {totalStudents !== null && studentsWithBacklogs !== null && totalStudents > 0
                  ? `${Math.round(((totalStudents - studentsWithBacklogs) / totalStudents) * 100)}% Clear`
                  : "No data available"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTPODashboard;
