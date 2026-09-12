import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../../api/dashboard.api";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import {
  GraduationCap,
  Award,
  Calendar,
  BookOpen,
  User,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardData();
      const payload = res.data || res;
      if (payload) {
        setData(payload);
      } else {
        throw new Error(res.message || "Failed to load student dashboard");
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

  if (loading) return <LoadingState message="Loading your student academic profile from database..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  const {
    student,
    enrolledSubjects = [],
    midMarks = [],
    timetables = [],
    backlogs = {},
  } = data;

  const rollNo = student?.rollNumber || student?.rollNo || "STUDENT";
  const semCode = student?.semesterId?.semesterCode || (student?.semesterId?.semesterNumber ? `Semester ${student?.semesterId?.semesterNumber}` : "Year 4");
  const branchName = student?.branchId?.name || "Engineering Department";
  const branchCode = student?.branchId?.code || "Branch";
  const sectionName = student?.sectionId?.sectionName || student?.sectionId?.name || student?.section || "A";
  const backlogCount = student?.backlogCount ?? backlogs?.count ?? backlogs?.totalCount ?? (backlogs?.details?.length || 0);

  return (
    <div className="space-y-6">
      {/* Profile Summary Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-academic-50 border border-academic-200/80 flex items-center justify-center text-academic-800 text-2xl font-bold flex-shrink-0 shadow-xs">
              {student?.name ? student.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Badge variant="academic">{branchCode}</Badge>
                <Badge variant="neutral">Year {student?.year || 4}</Badge>
                <Badge variant="info">{semCode}</Badge>
                <span className="font-mono text-xs sm:text-[13px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200/80">
                  {rollNo}
                </span>
              </div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                Welcome, {student?.name || "Student"}
              </h1>
              <p className="text-sm sm:text-[15px] text-slate-500 mt-1 leading-relaxed">
                {branchName} &bull; Section {sectionName} &bull; Academic Year {student?.year || 4}
              </p>
            </div>
          </div>

          <Link
            to="/student/profile"
            className="academic-button-secondary px-4 py-2 self-start sm:self-auto text-sm sm:text-[15px]"
          >
            <User className="w-4 h-4" />
            <span>View Full Profile</span>
          </Link>
        </div>
      </div>

      {/* Academic Modules Grid (Navigation Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mid Marks Module Card */}
        <div className="academic-card p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-academic-50 text-academic-700 flex items-center justify-center border border-academic-100">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Mid Examinations</h3>
              <p className="text-[13px] sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                {midMarks.length > 0 ? `${midMarks.length} recorded subject scores` : "Evaluated scores recorded by CTPO"}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">
              {midMarks.length > 0 ? `${midMarks.length} Records` : "No Marks Entered"}
            </span>
            <Link
              to="/student/mid-marks"
              className="text-sm font-semibold text-academic-700 hover:text-academic-900 flex items-center gap-1 cursor-pointer"
            >
              View Marks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Timetable Module Card */}
        <div className="academic-card p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Timetable</h3>
              <p className="text-[13px] sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                {timetables.length > 0 ? `${timetables.length} published schedules` : "Official branch timetable schedules"}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">
              {timetables.length > 0 ? `${timetables.length} Schedules` : "No Timetable"}
            </span>
            <Link
              to="/student/timetable"
              className="text-sm font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
            >
              View Timetable <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Backlogs Module Card */}
        <div className="academic-card p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              backlogCount > 0 ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Backlog Records</h3>
              <p className="text-[13px] sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                {backlogCount === 0 ? "Zero pending arrears recorded" : "Pending examination subjects"}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className={`text-sm font-bold ${backlogCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {backlogCount === 0 ? "0 Backlogs (Clear)" : `${backlogCount} Active Backlogs`}
            </span>
            <Link
              to="/student/backlogs"
              className="text-sm font-semibold text-academic-700 hover:text-academic-900 flex items-center gap-1 cursor-pointer"
            >
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Details (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Subjects List */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Enrolled Subjects</h2>
              <p className="text-[13px] sm:text-sm text-slate-500 mt-0.5">{semCode} registered curriculum</p>
            </div>
            <Badge variant="academic" size="md">
              {enrolledSubjects.length} Registered
            </Badge>
          </div>

          {enrolledSubjects.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No enrolled subjects loaded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {enrolledSubjects.map((sub, idx) => (
                <div key={sub._id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-slate-900">{sub.name || sub.subjectName || "Subject"}</span>
                    <span className="ml-2 font-mono text-xs sm:text-[13px] text-slate-400 font-semibold">{sub.code || sub.subjectCode}</span>
                  </div>
                  <span className="text-xs sm:text-[13px] text-academic-700 font-semibold bg-academic-50 px-2 py-0.5 rounded-md border border-academic-100/60">{sub.type || "Theory"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Evaluation Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Continuous Assessment Status</h2>
              <p className="text-[13px] sm:text-sm text-slate-500 mt-0.5">MID-1 & MID-2 evaluation progress</p>
            </div>
            <Badge variant="academic" size="md">
              Regulation: 2 Mids
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <Award className="w-4.5 h-4.5 text-academic-700" />
                <span className="font-semibold text-slate-800">MID-1 Internal Assessment</span>
              </div>
              <Badge variant={midMarks.some(m => String(m.midExam).includes("1")) ? "success" : "neutral"} size="sm">
                {midMarks.some(m => String(m.midExam).includes("1")) ? "Recorded" : "Pending"}
              </Badge>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <Award className="w-4.5 h-4.5 text-academic-700" />
                <span className="font-semibold text-slate-800">MID-2 Internal Assessment</span>
              </div>
              <Badge variant={midMarks.some(m => String(m.midExam).includes("2")) ? "success" : "neutral"} size="sm">
                {midMarks.some(m => String(m.midExam).includes("2")) ? "Recorded" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
