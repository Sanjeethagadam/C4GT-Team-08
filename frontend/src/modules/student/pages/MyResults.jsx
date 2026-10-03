import { useEffect, useState, useMemo } from "react";
import { LoadingSkeleton, ErrorState, DataTable } from "@/components/common";
import { resultService } from "@/services/resultService";
import { studentService } from "@/services/studentService";
import { GraduationCap, Award, User } from "lucide-react";
import verifiedRecordsIllustration from "@/assets/verified_records_target_illustration.png";
import { calculateGPA } from "@/utils/gpaUtils";

export const MyResults = () => {
  const [results, setResults] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resultsData, profileData] = await Promise.all([
        resultService.getMyResults(),
        studentService.getProfile(),
      ]);
      setResults(resultsData || []);
      setProfile(profileData);
    } catch (err) {
      setError(err.message || "Failed to load results");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const expectedSemesters = useMemo(() => {
    if (!results || results.length === 0) return [];
    const sems = new Set();
    results.forEach((r) => {
      const code = r.semesterId?.semesterCode;
      if (code && typeof code === "string") {
        sems.add(code);
      }
    });
    return Array.from(sems).sort();
  }, [results]);

  const groupedSemesters = useMemo(() => {
    const groups = {};
    // Initialize all expected semesters with empty arrays
    expectedSemesters.forEach((sem) => {
      groups[sem] = [];
    });
    if (results && results.length > 0) {
      results.forEach((r) => {
        const semCode = r.semesterId?.semesterCode || "Unknown Semester";
        if (groups[semCode] !== undefined) {
          const isDuplicate = groups[semCode].some((existing) => {
            const rName = r.subjectId?.subjectName || r.subjectName || "";
            const exName =
              existing.subjectId?.subjectName || existing.subjectName || "";
            const rNorm = rName
              .toUpperCase()
              .replace(/&/g, " & ")
              .replace(/\s+/g, " ")
              .trim();
            const exNorm = exName
              .toUpperCase()
              .replace(/&/g, " & ")
              .replace(/\s+/g, " ")
              .trim();
            const rCode = (
              r.subjectId?.subjectCode ||
              r.subjectCode ||
              ""
            ).toUpperCase();
            const exCode = (
              existing.subjectId?.subjectCode ||
              existing.subjectCode ||
              ""
            ).toUpperCase();
            const rIsLab =
              rName.toUpperCase().includes(" LAB") ||
              rName.toUpperCase().includes("LABORATORY") ||
              rCode.includes("LAB") ||
              rCode.endsWith("P");
            const exIsLab =
              exName.toUpperCase().includes(" LAB") ||
              exName.toUpperCase().includes("LABORATORY") ||
              exCode.includes("LAB") ||
              exCode.endsWith("P");
            if (rNorm === exNorm && rIsLab === exIsLab && rNorm !== "") {
              return true;
            }

            const sameId =
              existing.subjectId?._id &&
              r.subjectId?._id &&
              existing.subjectId?._id === r.subjectId?._id;
            const sameCode =
              existing.subjectId?.subjectCode &&
              r.subjectId?.subjectCode &&
              existing.subjectId?.subjectCode === r.subjectId?.subjectCode;
            if (r.subjectId?._id && existing.subjectId?._id) {
              return sameId;
            } else if (
              r.subjectId?.subjectCode &&
              existing.subjectId?.subjectCode
            ) {
              return sameCode;
            }
            return false;
          });
          if (!isDuplicate) {
            groups[semCode].push(r);
          }
        }
      });
    }
    return groups;
  }, [results, expectedSemesters]);

  const semesters = Object.keys(groupedSemesters).sort();
  const columns = [
    {
      header: "Subject Code",
      cell: (row) => row.subjectId?.subjectCode || "-",
    },
    {
      header: "Subject Name",
      cell: (row) => (
        <span className="font-medium text-slate-800">
          {row.subjectId?.subjectName || "-"}
        </span>
      ),
    },
    {
      header: "Credits",
      cell: (row) =>
        row.credits !== undefined && row.credits !== null ? row.credits : "-",
    },
    { header: "Grade", cell: (row) => row.grade || "-" },
    {
      header: "Grade Point",
      cell: (row) =>
        row.gradePoint !== undefined && row.gradePoint !== null
          ? row.gradePoint
          : "-",
    },
    {
      header: "Status",
      cell: (row) => {
        if (row.isHistorical) {
          return (
            <span
              className={`font-semibold ${row.resultStatus === "PASS" ? "text-emerald-600" : "text-red-600"}`}
            >
              {row.resultStatus}
            </span>
          );
        }
        return (
          <span
            className={`font-semibold ${row.resultStatus === "PASS" ? "text-emerald-600" : row.resultStatus === "FAIL" ? "text-red-600" : ""}`}
          >
            {row.resultStatus}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner matching project blue theme */}
      <div className="bg-gradient-to-r from-[#021024] via-[#052659] to-[#0A3670] rounded-2xl px-5 sm:px-6 py-4 sm:py-4.5 border border-[#5483B3]/35 shadow-sm text-white flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#021024]/85 border border-[#5483B3]/40 text-[#C1E8FF] text-[10px] font-semibold tracking-wide mb-1 shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-[#0090FF]" />
            <span>Academic Performance Record</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Student Academic Results
          </h1>
          <p className="text-[#C1E8FF]/80 text-xs mt-0.5">
            Official semester examinations and historical academic credits
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#052659]/80 border border-[#0090FF]/40 text-xs font-bold text-[#C1E8FF]">
          <Award className="w-4 h-4 text-[#0090FF]" />
          <span>Evaluation Portal</span>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          {/* 2. Student Information Section with Natural Academic Vector Illustration */}
          <div className="bg-white/95 rounded-2xl shadow-xs border border-[#7DA0CA]/35 p-4 sm:p-5 relative overflow-hidden mb-5">
            {/* Subtle light-blue corner glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#C1E8FF]/20 blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
              {/* Left Column: Student Details */}
              <div className="flex-1 space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-[#052659] text-white flex items-center justify-center shadow-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#021024] tracking-tight">
                      Student Information
                    </h3>
                    <p className="text-[10.5px] text-[#5483B3] font-medium">
                      Official candidate academic registry
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f8fbfe] border border-[#7DA0CA]/20">
                    <span className="text-[10.5px] font-bold text-slate-500 w-22 shrink-0">
                      Roll Number
                    </span>
                    <span className="font-extrabold text-[#052659] tracking-wider truncate">
                      {profile?.rollNo || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f8fbfe] border border-[#7DA0CA]/20">
                    <span className="text-[10.5px] font-bold text-slate-500 w-22 shrink-0">
                      Student Name
                    </span>
                    <span className="font-extrabold text-[#021024] uppercase truncate">
                      {profile?.name || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f8fbfe] border border-[#7DA0CA]/20 sm:col-span-2">
                    <span className="text-[10.5px] font-bold text-slate-500 w-22 shrink-0">
                      Campus
                    </span>
                    <span className="font-semibold text-slate-800 truncate">
                      {profile?.campusId?.name || "Kakinada Institute Of Engineering And Technology CoED"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f8fbfe] border border-[#7DA0CA]/20">
                    <span className="text-[10.5px] font-bold text-slate-500 w-22 shrink-0">
                      Degree
                    </span>
                    <span className="font-semibold text-slate-800">
                      Bachelor of Technology
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f8fbfe] border border-[#7DA0CA]/20">
                    <span className="text-[10.5px] font-bold text-slate-500 w-22 shrink-0">
                      Branch
                    </span>
                    <span className="font-bold text-[#0090FF] truncate">
                      {profile?.branchId?.name || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Verified Records Illustration (User-provided Target Checklist Artwork) */}
              <div className="hidden sm:flex flex-col items-center justify-center shrink-0 self-center pl-2">
                <div className="relative w-28 h-28 lg:w-32 lg:h-32 flex items-center justify-center group">
                  <div className="absolute inset-1 rounded-full bg-[#0090FF]/15 blur-xl pointer-events-none" />
                  <img
                    src={verifiedRecordsIllustration}
                    alt="Verified Academic Records"
                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,144,255,0.18)] animate-gentle-float select-none pointer-events-none"
                  />
                </div>
                <span className="text-[10px] font-extrabold tracking-wider text-[#5483B3] uppercase mt-0.5">
                  Verified Records
                </span>
              </div>
            </div>
          </div>

          {semesters.length > 0 ? (
            <div className="space-y-4">
              {semesters.map((sem) => (
                <div
                  key={sem}
                  className="bg-white rounded-xl shadow-xs border border-[#7DA0CA]/30 overflow-hidden"
                >
                  {groupedSemesters[sem].length > 0 ? (
                    <>
                      {/* Distinguishable soft light-blue header for Semester 1 to prevent merging with top dark-blue banner */}
                      <div
                        className={
                          sem.includes("1")
                            ? "bg-gradient-to-r from-[#d9ebf9] via-[#e8f3fc] to-[#d9ebf9] text-[#052659] font-bold px-4 py-2.5 text-xs tracking-wide flex justify-between items-center border-b border-[#7DA0CA]/45 shadow-2xs"
                            : "bg-gradient-to-r from-[#edf5fc] via-[#f5f9fd] to-[#edf5fc] text-[#052659] font-bold px-4 py-2.5 text-xs tracking-wide flex justify-between items-center border-b border-[#7DA0CA]/30"
                        }
                      >
                        <span className="font-extrabold text-[#021024] flex items-center gap-1.5">
                          Semester {sem.replace("-", "")}
                        </span>
                        <span
                          className={
                            sem.includes("1")
                              ? "text-[11px] text-[#052659] font-bold bg-white/85 px-2.5 py-0.5 rounded-full border border-[#7DA0CA]/40 shadow-2xs"
                              : "text-[11px] text-[#5483B3] font-semibold bg-white/70 px-2 py-0.5 rounded-md border border-[#7DA0CA]/25"
                          }
                        >
                          {groupedSemesters[sem].length} Courses Evaluated
                        </span>
                      </div>
                      <DataTable
                        data={groupedSemesters[sem]}
                        columns={columns}
                        emptyMessage="No official results found for this semester."
                      />

                      <div className="flex justify-end items-center py-2.5 px-5 bg-[#f0f6fc] border-t border-[#7DA0CA]/30 text-xs font-bold text-[#052659] gap-6">
                        <span>
                          Total Credits:{" "}
                          {calculateGPA(groupedSemesters[sem]).credits}
                        </span>
                        <span>
                          {groupedSemesters[sem].some((r) => r.isOfficial)
                            ? "Official SGPA: "
                            : "Derived SGPA: "}
                          {calculateGPA(groupedSemesters[sem]).gpa}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-[#f4f9fd] text-[#021024] font-bold px-4 py-2 text-xs border-b border-[#7DA0CA]/30">
                        Semester {sem.replace("-", "")}
                      </div>
                      <div className="bg-white p-6 text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#C1E8FF]/30 mb-2 text-[#052659]">
                          <GraduationCap className="w-5 h-5 text-[#052659]" />
                        </div>
                        <p className="text-[#5483B3] text-xs">
                          No official university result data available for this
                          semester.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Overall Summary */}
              {(() => {
                const allUniqueResults = Object.values(groupedSemesters).flat();
                
                const officialResultsOnly = allUniqueResults.filter(
                  (r) => !r.isHistorical,
                );
                
                const hasOfficialData = officialResultsOnly.length > 0;
                
                // Fallback: use actual available historical/past results if official JNTUK data is missing
                const officialGpaData = hasOfficialData
                  ? calculateGPA(officialResultsOnly)
                  : calculateGPA(allUniqueResults);
                  
                const derivedGpaData = calculateGPA(allUniqueResults);
                return (
                  <div className="bg-gradient-to-r from-[#021024] via-[#052659] to-[#0A3670] rounded-2xl shadow-lg border border-[#5483B3]/30 overflow-hidden mt-8 p-6 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#5483B3]/30">
                      <div className="flex flex-col items-center justify-center py-2">
                        <span className="text-[#C1E8FF]/80 text-xs font-bold uppercase tracking-wider mb-1">
                          Total Official Credits
                        </span>
                        <span className="text-3xl font-black text-white">
                          {officialGpaData.credits > 0
                            ? officialGpaData.credits
                            : "-"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2">
                        <span className="text-[#C1E8FF]/80 text-xs font-bold uppercase tracking-wider mb-1">
                          Official CGPA
                        </span>
                        <span className="text-4xl font-black text-white">
                          {officialGpaData.credits > 0
                            ? officialGpaData.gpa
                            : "-"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2 pl-4">
                        <span className="text-[#C1E8FF]/80 text-xs font-bold uppercase tracking-wider mb-1">
                          Calculated CGPA
                        </span>
                        <span className="text-4xl font-black text-emerald-400">
                          {derivedGpaData.gpa}
                        </span>
                        <span className="text-[10px] text-[#C1E8FF]/60 mt-1 uppercase font-bold tracking-widest">
                          Total Credits: {derivedGpaData.credits > 0 ? derivedGpaData.credits : "-"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2 pl-4">
                        <span className="text-[#C1E8FF]/80 text-xs font-bold uppercase tracking-wider mb-1">
                          Percentage
                        </span>
                        <span className="text-3xl font-black text-[#C1E8FF]">
                          {officialGpaData.credits > 0
                            ? (
                                (Number(officialGpaData.gpa) - 0.75) *
                                10
                              ).toFixed(2) + "%"
                            : derivedGpaData.credits > 0 && derivedGpaData.gpa !== "-"
                            ? (
                                (Number(derivedGpaData.gpa) - 0.75) * 10
                              ).toFixed(2) + "%"
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl shadow-xs border border-[#7DA0CA]/35">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C1E8FF]/40 text-[#052659] mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <p className="text-[#5483B3] font-medium">
                No official university result data available.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
