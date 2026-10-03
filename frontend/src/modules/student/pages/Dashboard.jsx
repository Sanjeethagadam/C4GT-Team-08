import { useEffect, useState } from "react";
import {
  StatCard,
  LoadingSkeleton,
  ErrorState,
  DataTable,
  AcademicProfileHero,
} from "@/components/common";
import { useAuth } from "@/providers/AuthProvider";
import { studentService } from "@/services/studentService";
import { examinationService } from "@/services/examinationService";
import { supportService } from "@/services/supportService";
import { analyticsService } from "@/services/analyticsService";
import {
  AlertTriangle,
  BookOpen,
  Users,
  Activity,
  GraduationCap,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { getAvatarUrl } from "@/utils/urlUtils";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [, setForceUpdate] = useState(0);
  const [profile, setProfile] = useState(null);
  const [marks, setMarks] = useState([]);
  const [remedialClasses, setRemedialClasses] = useState([]);
  const [personalAnalytics, setPersonalAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, marksRes, remedialRes, analyticsRes] =
        await Promise.allSettled([
          studentService.getProfile(),
          examinationService.getMyMarks(),
          supportService.getMyRemedialClasses(),
          analyticsService.getStudentPersonalAnalytics(),
        ]);

      if (profileRes.status === "fulfilled") setProfile(profileRes.value);
      if (marksRes.status === "fulfilled") setMarks(marksRes.value || []);
      if (remedialRes.status === "fulfilled")
        setRemedialClasses(remedialRes.value || []);
      if (analyticsRes.status === "fulfilled")
        setPersonalAnalytics(analyticsRes.value);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const handleProfileUpdate = () => {
      setForceUpdate((prev) => prev + 1);
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
        <LoadingSkeleton type="table" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  const backlogs = personalAnalytics?.backlogs || [];
  const activeBacklogsCount = backlogs.length;
  let currentRisk = "LOW";
  if (activeBacklogsCount >= 5) currentRisk = "HIGH";
  else if (activeBacklogsCount >= 2) currentRisk = "MEDIUM";

  const studentName =
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "") ||
    profile?.name ||
    user?.username ||
    "ARIPAKA HARSHAVARDHAN";

  const studentRoll = profile?.rollNo || user?.username || "24B21A4256";
  const branchName =
    profile?.branchId?.name || "Artificial Intelligence and Machine Learning";
  const currentYear = profile?.year || 3;
  const currentSemCode = profile?.semesterId?.semesterCode || "3-1";

  // Semester Roadmap definitions
  const roadmapTerms = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
  
  // Calculate current term index based on Year and Sem
  const semPart = parseInt(currentSemCode.split("-")[1] || "1", 10);
  const currentTermIndex = (currentYear - 1) * 2 + (semPart - 1);

  const marksColumns = [
    { header: "Subject", cell: (row) => row.subjectId?.subjectName || "-" },
    { header: "Code", cell: (row) => row.subjectId?.subjectCode || "-" },
    {
      header: "Exam Type",
      cell: (row) =>
        row.examinationId?.type || row.examinationId?.examType || "-",
    },
    {
      header: "Marks (Internal)",
      cell: (row) =>
        row.status === "ATTENDED"
          ? `${row.marksObtained} / ${(row.examinationId?.type || row.examinationId?.examType)?.includes("MID") ? 30 : row.maxMarks}`
          : row.status || "-",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Student Academic Hero Card — Shared AcademicProfileHero */}
      <AcademicProfileHero
        title="Student Academic Profile"
        icon={GraduationCap}
        name={studentName}
        avatar={getAvatarUrl(user?.avatarFileId || user?.avatar)}
        fallbackText={studentName.charAt(0)}
        badges={[
          { label: `Roll No: ${studentRoll}` },
          { label: branchName },
          {
            label: `Year ${currentYear} • Sem ${currentSemCode}`,
            highlight: true,
            dotColor: "bg-emerald-400",
          },
        ]}
        visionTitle="Academic Vision"
        visionWords={["Dream", "Learn", "Achieve"]}
      />

      {/* 2. Academic Attention Alert Banner — Exact Match of Image 1 */}
      {activeBacklogsCount > 0 && (
        <div className="bg-[#FFF5F5] border border-[#FECDD3] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-[0_2px_10px_rgba(244,63,94,0.04)]">
          <div className="w-9 h-9 rounded-xl bg-rose-100/90 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 mt-0.5 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#991B1B] tracking-tight">
              Academic Attention Required: Active Backlogs
            </h4>
            <p className="text-xs text-[#B91C1C]/90 mt-1 leading-relaxed">
              You currently have <span className="font-bold">{activeBacklogsCount} active backlog{activeBacklogsCount !== 1 ? "s" : ""}</span> on record. Please check the Remedial Classes tab for scheduled mentoring sessions or apply for upcoming supplementary examinations.
            </p>
          </div>
        </div>
      )}

      {/* 3. Four Statistic Information Cards — Exact Match of Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Active Backlogs"
          value={activeBacklogsCount}
          icon={AlertTriangle}
          contextLine="Requires Attention"
          variant="backlogs"
        />

        <StatCard
          title="Calculated Risk"
          value={currentRisk}
          icon={Activity}
          contextLine="Based on backlog threshold"
          variant="risk"
        />

        <StatCard
          title="Remedial Classes"
          value={remedialClasses.length}
          icon={Users}
          contextLine="Assigned Support Sessions"
          variant="remedial"
        />

        <StatCard
          title="Internal Subjects"
          value={new Set(marks.map((m) => m.subjectId?._id)).size || 0}
          icon={BookOpen}
          contextLine="Marks Evaluated"
          variant="subjects"
        />
      </div>

      {/* 4. Academic Progress Roadmap — Exact Match of Image 1 */}
      <Card className="bg-white rounded-2xl shadow-xs border border-[#7DA0CA]/30 p-4 sm:p-5 overflow-hidden">
        {/* Roadmap Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#021024] tracking-tight">
              Academic Progress Roadmap
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Trajectory across 8 undergraduate terms
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-0.5 rounded-full text-xs font-semibold border border-[#0090FF]/40 text-[#0090FF] bg-[#0090FF]/5">
            4 – Year B.Tech Program
          </span>
        </div>

        {/* Horizontal Timeline Track */}
        <div className="pt-8 pb-4 px-2 sm:px-6 overflow-x-auto">
          <div className="min-w-[650px] relative flex items-center justify-between">
            {/* Horizontal Line connecting through centers */}
            <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-200 -z-0"></div>

            {roadmapTerms.map((term, idx) => {
              const isPassed = idx < currentTermIndex;
              const isCurrent = idx === currentTermIndex;

              return (
                <div key={term} className="relative z-10 flex flex-col items-center">
                  {/* Status Circle / Badge */}
                  {isPassed ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-10 h-10 rounded-xl bg-[#0090FF] border-2 border-[#0090FF] text-white flex items-center justify-center font-bold text-xs shadow-[0_2px_10px_rgba(0,144,255,0.4)]">
                      {term}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center font-medium text-xs">
                      {term}
                    </div>
                  )}

                  {/* Labels underneath */}
                  <div className="mt-3 text-center">
                    <p
                      className={`text-xs font-bold ${
                        isCurrent
                          ? "text-[#0090FF]"
                          : isPassed
                            ? "text-slate-800"
                            : "text-slate-400"
                      }`}
                    >
                      {isCurrent ? "Current Term" : term}
                    </p>
                    <p
                      className={`text-[10px] font-bold tracking-wider mt-0.5 uppercase ${
                        isPassed
                          ? "text-emerald-600"
                          : isCurrent
                            ? "text-[#0090FF]"
                            : "text-slate-400"
                      }`}
                    >
                      {isPassed
                        ? "PASSED"
                        : isCurrent
                          ? "IN PROGRESS"
                          : "UPCOMING"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 5. Recent Internal Marks Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#7DA0CA]/30 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-[#f4f9fd]/50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-[#021024]">
              Recent Internal Marks
            </h3>
            <p className="text-xs text-[#5483B3] font-medium mt-0.5">
              Subject evaluations for active semester
            </p>
          </div>
          <span className="text-xs font-semibold bg-[#C1E8FF]/60 text-[#052659] px-3 py-1 rounded-full border border-[#7DA0CA]/30">
            Current Semester ({currentSemCode})
          </span>
        </div>
        <div className="p-0">
          <DataTable
            data={marks.slice(0, 8)}
            columns={marksColumns}
            emptyMessage="No internal marks recorded for this semester yet."
          />
        </div>
      </div>
    </div>
  );
};
