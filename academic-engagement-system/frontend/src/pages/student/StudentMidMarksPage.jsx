import React, { useState, useEffect } from "react";
import { getMyMidMarks } from "../../api/midMarks.api";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import { Award, BookOpen, Layers, CheckCircle2, AlertCircle } from "lucide-react";

export default function StudentMidMarksPage() {
  const [semesterGroups, setSemesterGroups] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("ALL");
  const [activeMidTab, setActiveMidTab] = useState("MID-1"); // 'MID-1' or 'MID-2'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMarksData();
  }, []);

  const fetchMarksData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyMidMarks();
      const payload = res.data || res;

      if (payload?.semesters && Array.isArray(payload.semesters)) {
        setSemesterGroups(payload.semesters);
      } else {
        // Construct from raw marks array if returned
        const marksList = payload?.marks || (Array.isArray(payload) ? payload : []);
        const semMap = {};

        marksList.forEach((record) => {
          const sId = record.semesterId?._id || record.semesterId || "current";
          const sCode = record.semesterId?.semesterCode || (record.semesterId?.semesterNumber ? `Semester ${record.semesterId.semesterNumber}` : "4-1 Semester");

          if (!semMap[sId]) {
            semMap[sId] = {
              semesterId: sId,
              semesterCode: sCode,
              year: record.semesterId?.year || 4,
              subjects: {},
            };
          }

          const subId = record.subjectId?._id || record.subjectId?.code || record.subjectId || "sub";
          const subName = record.subjectId?.subjectName || record.subjectId?.name || "Subject";
          const subCode = record.subjectId?.code || "SUB";

          if (!semMap[sId].subjects[subId]) {
            semMap[sId].subjects[subId] = {
              subjectId: subId,
              subjectName: subName,
              subjectCode: subCode,
              mid1: { status: "NOT_ENTERED", marks: null, maxMarks: 30 },
              mid2: { status: "NOT_ENTERED", marks: null, maxMarks: 30 },
            };
          }

          const mExam = String(record.midExam).toUpperCase();
          const marksVal = record.marksObtained ?? record.marks;
          if (mExam === "MID-1" || mExam === "1" || mExam === "MID1") {
            semMap[sId].subjects[subId].mid1 = {
              status: marksVal !== null && marksVal !== undefined ? "ENTERED" : "NOT_ENTERED",
              marks: marksVal,
              maxMarks: record.maxMarks || 30,
            };
          } else if (mExam === "MID-2" || mExam === "2" || mExam === "MID2") {
            semMap[sId].subjects[subId].mid2 = {
              status: marksVal !== null && marksVal !== undefined ? "ENTERED" : "NOT_ENTERED",
              marks: marksVal,
              maxMarks: record.maxMarks || 30,
            };
          }
        });

        const groups = Object.values(semMap).map((sem) => ({
          ...sem,
          subjects: Object.values(sem.subjects),
        }));
        setSemesterGroups(groups);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your mid examination marks.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your mid evaluation scores from database..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchMarksData} />;
  }

  const filteredSemesters = selectedSemesterId === "ALL"
    ? semesterGroups
    : semesterGroups.filter((s) => String(s.semesterId) === String(selectedSemesterId));

  const totalSubjects = filteredSemesters.reduce((acc, sem) => acc + (sem.subjects?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            Mid Examination Marks
          </h1>
          <p className="text-sm sm:text-[15px] text-slate-500 mt-1">
            Internal evaluation scores recorded strictly for your enrolled account
          </p>
        </div>

        {/* Semester Filter if multiple exist */}
        {semesterGroups.length > 1 && (
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-academic-500/20 shadow-xs cursor-pointer"
            >
              <option value="ALL">All Semesters</option>
              {semesterGroups.map((s) => (
                <option key={s.semesterId} value={s.semesterId}>
                  {s.semesterCode}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Examination Switcher Tabs (MID-1 vs MID-2 strictly) */}
      <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveMidTab("MID-1")}
          className={`px-5 py-2.5 text-sm sm:text-[15px] font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeMidTab === "MID-1"
              ? "bg-academic-800 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>MID-1 Examination</span>
        </button>

        <button
          onClick={() => setActiveMidTab("MID-2")}
          className={`px-5 py-2.5 text-sm sm:text-[15px] font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeMidTab === "MID-2"
              ? "bg-academic-800 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>MID-2 Examination</span>
        </button>
      </div>

      {/* Marks Table or Empty State */}
      {filteredSemesters.length === 0 || totalSubjects === 0 ? (
        <EmptyState
          icon={Award}
          title="Mid marks have not been entered yet."
          description="Your marks for this examination will appear here as soon as they are recorded by the CTPO."
        />
      ) : (
        <div className="space-y-6">
          {filteredSemesters.map((sem) => (
            <div
              key={sem.semesterId}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {sem.semesterCode || "Academic Term"}
                  </h2>
                  <p className="text-[13px] sm:text-sm text-slate-500 mt-0.5">
                    Continuous evaluation under {activeMidTab}
                  </p>
                </div>
                <Badge variant="academic" size="md">
                  {activeMidTab}
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm sm:text-[15px]">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200/80 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4 sm:px-6">Subject Code</th>
                      <th className="py-3.5 px-4 sm:px-6">Subject Name</th>
                      <th className="py-3.5 px-4 text-center">Marks (Max: 30)</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sem.subjects.map((sub) => {
                      const examData = activeMidTab === "MID-1" ? sub.mid1 : sub.mid2;
                      const hasMarks = examData && examData.marks !== null && examData.marks !== undefined;
                      const marksVal = hasMarks ? examData.marks : null;
                      const isPassing = marksVal !== null && marksVal >= 14;

                      return (
                        <tr key={sub.subjectId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900">
                            {sub.subjectCode}
                          </td>
                          <td className="py-4 px-4 sm:px-6 font-semibold text-slate-800">
                            {sub.subjectName}
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-slate-900">
                            {hasMarks ? `${marksVal} / ${examData.maxMarks || 30}` : "—"}
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right">
                            {hasMarks ? (
                              <Badge variant={isPassing ? "success" : "danger"} size="sm">
                                {isPassing ? "Completed" : "Fail (<14)"}
                              </Badge>
                            ) : (
                              <Badge variant="neutral" size="sm">
                                Not Entered
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
