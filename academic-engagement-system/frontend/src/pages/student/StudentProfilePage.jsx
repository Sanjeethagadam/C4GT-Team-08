import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile } from "../../api/students.api";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { Badge } from "../../components/common/Badge";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Building2,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyProfile();
      const profData = res.data || res;
      setProfile(profData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load academic profile details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your academic profile from database..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchProfileData} />;
  }

  const branchObj = profile?.branch || profile?.branchId;
  const semObj = profile?.semester || profile?.semesterId;
  const secObj = profile?.section || profile?.sectionId;
  const roll = profile?.rollNo || profile?.rollNumber || user?.username;
  const semCode = semObj?.semesterCode || (semObj?.semesterNumber ? `Semester ${semObj.semesterNumber}` : "Year 4 Semester 1");
  const backlogCount = profile?.backlogCount ?? profile?.backlogs?.count ?? profile?.backlogs?.totalCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-academic-50 border border-academic-200/80 flex items-center justify-center text-academic-800 text-3xl font-bold flex-shrink-0 shadow-xs">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900">{profile?.name || user?.name}</h1>
                <Badge variant="academic">{branchObj?.code || "Branch"}</Badge>
                <Badge variant="neutral">Year {profile?.year || 4}</Badge>
                <Badge variant="info">{semCode}</Badge>
              </div>
              <p className="text-sm sm:text-[15px] font-medium text-slate-500">
                Roll Number: <span className="font-mono text-slate-900 font-bold">{roll}</span>
              </p>
              <p className="text-xs sm:text-[13px] text-slate-400">
                Academic Engagement System &bull; Authenticated Student Account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Information (No Academic Standing) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Details (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-academic-50 border border-academic-100 flex items-center justify-center text-academic-700">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Academic Master Information</h2>
              <p className="text-[13px] sm:text-sm text-slate-500 mt-0.5">Official college departmental records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Department / Branch</p>
              <p className="text-[15px] sm:text-base font-bold text-slate-800 mt-1">
                {branchObj?.name || "Department of Engineering"}
              </p>
              <p className="text-xs sm:text-[13px] text-academic-700 font-mono mt-0.5 font-semibold">Code: {branchObj?.code || "N/A"}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Section Assignment</p>
              <p className="text-[15px] sm:text-base font-bold text-slate-800 mt-1">
                Section {secObj?.sectionName || secObj?.name || secObj || "A"}
              </p>
              <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">Year {profile?.year || 4} Undergraduate</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Semester</p>
              <p className="text-[15px] sm:text-base font-bold text-slate-800 mt-1">
                {semCode}
              </p>
              <p className="text-xs sm:text-[13px] text-emerald-600 font-semibold mt-0.5">Active Academic Term</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Backlog Count</p>
              <p className={`text-[15px] sm:text-base font-bold mt-1 ${backlogCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {backlogCount === 0 ? "0 Backlogs (Clear)" : `${backlogCount} Active Backlogs`}
              </p>
              <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">University Examination Records</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Institutional Email</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{profile?.email || `${(roll || "student").toLowerCase()}@college.edu`}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <Phone className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Contact Phone</p>
                  <p className="text-sm font-semibold text-slate-800">{profile?.phone || "On Institutional Record"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-academic-700" />
              <h2 className="text-base font-bold text-slate-900">Student Portal Status</h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                <span>Verified Student Identity</span>
              </div>
              <p className="text-[13px] sm:text-sm text-slate-500 leading-relaxed">
                Your account is active and verified for {branchObj?.name || branchObj?.code || "Department"} Year {profile?.year || 4}.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Branch CTPO</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {branchObj?.code ? `${branchObj.code} Branch Officer` : "CTPO Officer"}
              </p>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                Authorized for mid evaluation marks entry and examination scheduling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
