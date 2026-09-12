import React, { useState, useEffect } from "react";
import { getSemesters } from "../../api/semesters.api";
import { getStudents } from "../../api/students.api";
import { getSubjects } from "../../api/subjects.api";
import {
  saveMidMarks,
  getMidMarksByStudent,
  getBranchMidMarks,
} from "../../api/midMarks.api";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Save,
  Search,
  BookOpen,
  User,
  History,
  Sparkles,
  RefreshCw,
  Layers,
  ChevronRight,
  Check,
} from "lucide-react";

export const CTPOMidMarksPage = () => {
  // Master data
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Selections
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedMid, setSelectedMid] = useState("MID-1"); // Strictly "MID-1" or "MID-2" ONLY

  // Marks states: { [subjectId]: marksValue }
  const [marksState, setMarksState] = useState({});
  const [existingMarksMap, setExistingMarksMap] = useState({});

  // Loading & Submission Statuses
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Student search
  const [studentSearch, setStudentSearch] = useState("");

  // 1. Initial Load: Semesters & Branch Students
  useEffect(() => {
    const init = async () => {
      setLoadingInitial(true);
      setErrorMessage("");
      try {
        const [semRes, stuRes] = await Promise.all([
          getSemesters(),
          getStudents(),
        ]);

        const semsList = semRes.data || semRes || [];
        const studentsList = stuRes.data || stuRes || [];

        // Prefer 4th year semesters
        const y4Semesters = semsList.filter((s) => s.year === 4);
        const availableSems = y4Semesters.length > 0 ? y4Semesters : semsList;
        setSemesters(availableSems);

        if (availableSems.length > 0) {
          setSelectedSemesterId(availableSems[0]._id);
        }

        setStudents(studentsList);
        if (studentsList.length > 0) {
          setSelectedStudentId(studentsList[0]._id);
        }
      } catch (err) {
        setErrorMessage("Failed to load master records: " + (err.response?.data?.message || err.message));
      } finally {
        setLoadingInitial(false);
      }
    };

    init();
  }, []);

  // 2. Fetch Subjects when Semester or Student Branch changes
  useEffect(() => {
    if (!selectedSemesterId || !selectedStudentId) return;

    const fetchSubjs = async () => {
      setLoadingSubjects(true);
      try {
        const student = students.find((s) => s._id === selectedStudentId);
        const branchId = student?.branchId?._id || student?.branchId;

        const subRes = await getSubjects({
          semesterId: selectedSemesterId,
          ...(branchId ? { branchId } : {}),
        });

        const subList = subRes.data || subRes || [];
        setSubjects(subList);
      } catch (err) {
        console.warn("Error fetching subjects:", err.message);
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjs();
  }, [selectedSemesterId, selectedStudentId, students]);

  // 3. Load Existing Marks for this (Student, Semester, Mid)
  const fetchExistingMarks = async () => {
    if (!selectedStudentId || !selectedSemesterId) return;

    setLoadingMarks(true);
    try {
      const res = await getMidMarksByStudent(selectedStudentId);
      const marksList = res.data?.marks || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
      if (Array.isArray(marksList)) {
        const matching = marksList.filter((m) => {
          const semId = m.semesterId?._id || m.semesterId;
          const mExam = String(m.midExam).toUpperCase();
          const target = selectedMid.toUpperCase();
          const isMidMatch = mExam === target || mExam === target.replace("-", "") || mExam === (selectedMid === "MID-1" ? "1" : "2");
          return String(semId) === String(selectedSemesterId) && isMidMatch;
        });

        const existingMap = {};
        const inputsMap = {};

        matching.forEach((m) => {
          const subId = m.subjectId?._id || m.subjectId;
          const marksVal = m.marksObtained ?? m.marks;
          existingMap[subId] = marksVal;
          inputsMap[subId] = marksVal !== undefined && marksVal !== null ? marksVal.toString() : "";
        });

        setExistingMarksMap(existingMap);
        setMarksState(inputsMap);
      } else {
        setExistingMarksMap({});
        setMarksState({});
      }
    } catch (err) {
      setExistingMarksMap({});
      setMarksState({});
    } finally {
      setLoadingMarks(false);
    }
  };

  useEffect(() => {
    fetchExistingMarks();
  }, [selectedStudentId, selectedSemesterId, selectedMid]);

  const handleMarkChange = (subjectId, value) => {
    // Only allow numbers 0 to 30 or empty
    if (value === "" || (/^\d+$/.test(value) && parseInt(value, 10) <= 30 && parseInt(value, 10) >= 0)) {
      setMarksState((prev) => ({
        ...prev,
        [subjectId]: value,
      }));
    }
  };

  const handleSaveMarks = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    if (!selectedStudentId) {
      setErrorMessage("Please select a student.");
      return;
    }
    if (!selectedSemesterId) {
      setErrorMessage("Please select a semester.");
      return;
    }

    // Prepare payload of entered marks
    const entries = [];
    subjects.forEach((subj) => {
      const enteredStr = marksState[subj._id];
      if (enteredStr !== undefined && enteredStr !== "") {
        entries.push({
          subjectId: subj._id,
          marks: parseInt(enteredStr, 10),
          maxMarks: 30,
        });
      }
    });

    if (entries.length === 0) {
      setErrorMessage("Please enter marks for at least one subject before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        studentId: selectedStudentId,
        semesterId: selectedSemesterId,
        midExam: selectedMid, // strictly "MID-1" or "MID-2"
        marks: entries,
      };

      const res = await saveMidMarks(payload);
      if (res.success) {
        setSuccessMessage("Marks saved successfully.");
        // Refresh directly from backend
        await fetchExistingMarks();
      } else {
        throw new Error(res.message || "Unable to save marks.");
      }
    } catch (err) {
      setErrorMessage("Unable to save marks: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return <LoadingState message="Loading student records and academic terms..." />;
  }

  const selectedStudentObj = students.find((s) => s._id === selectedStudentId);
  const selectedSemesterObj = semesters.find((s) => s._id === selectedSemesterId);

  // Filter students for dropdown / selection
  const filteredStudents = students.filter((s) => {
    const query = studentSearch.toLowerCase();
    const roll = (s.rollNo || s.rollNumber || "").toLowerCase();
    const name = (s.name || "").toLowerCase();
    return roll.includes(query) || name.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
          Mid Examination Marks Evaluation
        </h1>
        <p className="text-sm sm:text-[15px] text-slate-500 mt-0.5">
          Record and publish continuous internal assessment marks for your assigned branch students
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4-Step Workflow Progress Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-academic-50/80 border border-academic-200/60">
            <div className="w-8 h-8 rounded-lg bg-academic-800 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-academic-700">Step 1</p>
              <p className="text-sm font-semibold text-slate-900">Select Student</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-academic-50/80 border border-academic-200/60">
            <div className="w-8 h-8 rounded-lg bg-academic-800 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-academic-700">Step 2</p>
              <p className="text-sm font-semibold text-slate-900">Select Semester</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-academic-50/80 border border-academic-200/60">
            <div className="w-8 h-8 rounded-lg bg-academic-800 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-academic-700">Step 3</p>
              <p className="text-sm font-semibold text-slate-900">Select Examination</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-academic-50/80 border border-academic-200/60">
            <div className="w-8 h-8 rounded-lg bg-academic-800 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-academic-700">Step 4</p>
              <p className="text-sm font-semibold text-slate-900">Enter Marks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps 1 - 3 Controls Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1: Select Student */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Step 1: Select Student
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-academic-500"
                />
              </div>

              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-academic-500/20 cursor-pointer"
              >
                {filteredStudents.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.rollNo || s.rollNumber} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Select Semester */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Step 2: Select Semester
            </label>
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-academic-500/20 cursor-pointer"
            >
              {semesters.map((sem) => (
                <option key={sem._id} value={sem._id}>
                  {sem.semesterCode || `Semester ${sem.semesterNumber}`} (Year {sem.year || 4})
                </option>
              ))}
            </select>
            <p className="text-xs sm:text-[13px] text-slate-500">
              Subjects are loaded dynamically from the backend for this semester.
            </p>
          </div>

          {/* Step 3: Select Examination (MID-1 or MID-2 strictly) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Step 3: Select Examination
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMid("MID-1")}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer border ${
                  selectedMid === "MID-1"
                    ? "bg-academic-800 text-white border-academic-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>MID-1</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMid("MID-2")}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer border ${
                  selectedMid === "MID-2"
                    ? "bg-academic-800 text-white border-academic-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>MID-2</span>
              </button>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500">
              Institutional regulation: Only MID-1 and MID-2 internal exams exist.
            </p>
          </div>
        </div>

        {/* Selected Context Summary */}
        {selectedStudentObj && selectedSemesterObj && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Evaluating Student:</span>
              <span className="font-bold text-slate-900">{selectedStudentObj.name}</span>
              <span className="font-mono text-slate-500">({selectedStudentObj.rollNo || selectedStudentObj.rollNumber})</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="academic" size="md">
                {selectedSemesterObj.semesterCode || `Sem ${selectedSemesterObj.semesterNumber}`}
              </Badge>
              <Badge variant="info" size="md">
                {selectedMid}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Mark Entry Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Step 4: Enter Subject Marks (Max: 30)
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Enter evaluated scores for each enrolled semester subject
            </p>
          </div>

          <button
            onClick={handleSaveMarks}
            disabled={saving || loadingSubjects || loadingMarks || subjects.length === 0}
            className="academic-button-primary px-5 py-2.5 text-sm"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Marks</span>
              </>
            )}
          </button>
        </div>

        {loadingSubjects || loadingMarks ? (
          <div className="p-8 text-center text-sm text-slate-500">
            <LoadingState message="Loading subjects and existing marks from database..." />
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects available for this semester."
            description="There are no academic subjects registered in the database for the selected branch and semester."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm sm:text-[15px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-sm font-semibold text-slate-600">
                  <th className="py-3.5 px-4 sm:px-6">Subject Code</th>
                  <th className="py-3.5 px-4 sm:px-6">Subject Name</th>
                  <th className="py-3.5 px-4 text-center">Previous Mark</th>
                  <th className="py-3.5 px-4">Enter Mark (0-30)</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((subj) => {
                  const subCode = subj.code || subj.subjectCode || "SUB";
                  const subName = subj.name || subj.subjectName || "Subject";
                  const prevMark = existingMarksMap[subj._id];
                  const currentInput = marksState[subj._id] ?? "";
                  const isSaved = prevMark !== undefined && prevMark !== null && String(prevMark) === String(currentInput);
                  const isModified = currentInput !== "" && (prevMark === undefined || String(prevMark) !== String(currentInput));

                  return (
                    <tr key={subj._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900">
                        {subCode}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800">
                        {subName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                        {prevMark !== undefined && prevMark !== null ? prevMark : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 max-w-[140px]">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            placeholder="Enter"
                            value={currentInput}
                            onChange={(e) => handleMarkChange(subj._id, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-slate-900 text-[15px] focus:outline-hidden focus:ring-2 focus:ring-academic-500/20 focus:border-academic-700"
                          />
                          <span className="text-sm text-slate-400 font-semibold">/30</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {isSaved ? (
                          <Badge variant="success" size="md">
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </Badge>
                        ) : isModified ? (
                          <Badge variant="warning" size="md">
                            <span>Modified</span>
                          </Badge>
                        ) : prevMark !== undefined && prevMark !== null ? (
                          <Badge variant="academic" size="md">
                            <span>Recorded</span>
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="md">
                            <span>Not Entered</span>
                          </Badge>
                        )}
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

export default CTPOMidMarksPage;
