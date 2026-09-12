import React, { useState, useEffect } from "react";
import { getMyProfile } from "../../api/students.api";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { BookOpen, CheckCircle2, Layers } from "lucide-react";

export default function StudentBacklogsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyProfile();
      const profData = res.data || res;
      setProfile(profData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load backlog information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <LoadingState message="Loading your backlog records from database..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProfile} />;

  const backlogs = profile?.backlogs || {};
  const backlogDetails = Array.isArray(backlogs.details) ? backlogs.details : [];
  const totalCount = profile?.backlogCount ?? backlogs.count ?? backlogs.totalCount ?? backlogDetails.length;
  const rollNo = profile?.rollNo || profile?.rollNumber || "Student";
  const branchCode = profile?.branch?.code || profile?.branchId?.code || "Branch";

  // Group real backlogs by semester
  const semesterCountMap = {};
  backlogDetails.forEach((b) => {
    const sem = b.semester || b.semesterCode || "Other";
    semesterCountMap[sem] = (semesterCountMap[sem] || 0) + 1;
  });

  const semesterEntries = Object.entries(semesterCountMap);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            Supplementary & Backlog Records
          </h1>
          <p className="text-sm sm:text-[15px] text-slate-500 mt-1">
            University examination arrears record for <span className="font-mono font-bold text-slate-800">{rollNo}</span> ({branchCode})
          </p>
        </div>
        <Badge variant={totalCount === 0 ? "success" : "danger"} size="md">
          {totalCount === 0 ? "0 Backlogs" : `${totalCount} Backlogs`}
        </Badge>
      </div>

      {/* Total Backlogs Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total Backlogs"
          value={totalCount}
          subtitle={totalCount === 0 ? "All enrolled subjects cleared" : "Pending examination subjects"}
          icon={BookOpen}
          variant={totalCount === 0 ? "emerald" : "rose"}
        />
        <StatCard
          title="Affected Semesters"
          value={semesterEntries.length}
          subtitle={totalCount === 0 ? "Zero backlog terms" : "Semesters with pending papers"}
          icon={Layers}
          variant={totalCount === 0 ? "emerald" : "amber"}
        />
      </div>

      {/* Semester-Wise Backlog Count Breakdown */}
      {semesterEntries.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            Semester-Wise Backlog Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {semesterEntries.map(([sem, count]) => (
              <div key={sem} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{sem}</p>
                <p className="text-xl font-bold text-rose-600 mt-1">{count} {count === 1 ? "backlog" : "backlogs"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area: Table or Empty State */}
      {totalCount === 0 || backlogDetails.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No backlog data available."
          description="You do not have any pending backlogs in your official university examination record."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Pending Backlog Subjects
            </h3>
            <Badge variant="danger" size="md">{backlogDetails.length} Arrears</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm sm:text-[15px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Semester</th>
                  <th className="py-3.5 px-4">Subject Code</th>
                  <th className="py-3.5 px-4 sm:px-6">Subject Name</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backlogDetails.map((b, idx) => (
                  <tr key={b.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-semibold text-slate-800">
                      {b.semester || b.semesterCode || "N/A"}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      {b.subjectCode || b.code || "SUB"}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-800">
                      {b.subjectName || b.name || "Subject"}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <Badge variant="danger" size="sm">
                        {b.status || "ARREAR"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
