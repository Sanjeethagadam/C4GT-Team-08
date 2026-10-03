import { useEffect, useState } from "react";
import { PageHeader, LoadingSkeleton, ErrorState } from "@/components/common";
import { studentService } from "@/services/studentService";
import { subjectService } from "@/services/subjectService";
import { examinationService } from "@/services/examinationService";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";

export const Marks = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [allMarks, setAllMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [rows, setRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const scopeFilter = { sectionId: user?.scope?.sectionId };
      const [studentsData, subjectsData, examsData, marksData] =
        await Promise.all([
          studentService.getAllStudents(scopeFilter),
          subjectService.getAllSubjects(),
          examinationService.getAllExaminations(),
          examinationService.getAllMarks(),
        ]);
      setStudents(studentsData);
      setSubjects(subjectsData);
      setExaminations(examsData);
      setAllMarks(marksData);
      if (examsData.length > 0) setSelectedExam(examsData[0]._id);
      if (subjectsData.length > 0) setSelectedSubject(subjectsData[0]._id);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update rows when selection changes
  useEffect(() => {
    if (!selectedExam || !selectedSubject || students.length === 0) {
      setRows([]);
      return;
    }
    const newRows = students.map((student) => {
      const markRecord = allMarks.find(
        (m) =>
          m.studentId === student._id &&
          (typeof m.subjectId === "string" ? m.subjectId : m.subjectId._id) ===
            selectedSubject &&
          (typeof m.examinationId === "string"
            ? m.examinationId
            : m.examinationId._id) === selectedExam,
      );
      return {
        student,
        markRecord,
        editedMark: markRecord ? String(markRecord.marks) : "",
      };
    });
    setRows(newRows);
    setSaveMessage(null);
  }, [selectedExam, selectedSubject, students, allMarks]);

  const handleMarkChange = (studentId, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.student._id === studentId ? { ...r, editedMark: value } : r,
      ),
    );
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      // Find rows that were changed
      const changes = rows.filter((r) => {
        const original = r.markRecord ? String(r.markRecord.marks) : "";
        return r.editedMark !== original && r.editedMark.trim() !== "";
      });
      if (changes.length === 0) {
        setSaveMessage({ type: "success", text: "No changes to save." });
        setIsSaving(false);
        return;
      }
      const promises = changes.map(async (row) => {
        const numericMark = parseFloat(row.editedMark);
        if (isNaN(numericMark))
          throw new Error(`Invalid mark for student ${row.student.rollNo}`);
        if (row.markRecord) {
          return examinationService.updateMark(row.markRecord._id, {
            marks: numericMark,
          });
        } else {
          return examinationService.createMark({
            studentId: row.student._id,
            subjectId: selectedSubject,
            examinationId: selectedExam,
            marks: numericMark,
          });
        }
      });
      await Promise.all(promises);
      // Refresh marks data
      const newMarks = await examinationService.getAllMarks();
      setAllMarks(newMarks);
      setSaveMessage({ type: "success", text: "Marks saved successfully!" });
    } catch (err) {
      setSaveMessage({
        type: "error",
        text: err.message || "Failed to save marks.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Marks Entry & View"
        description="View and enter marks for your assigned class."
      />

      {isLoading ? (
        <LoadingSkeleton type="form" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#7DA0CA]/40 shadow-xs flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#052659] mb-1.5">
                Select Examination
              </label>
              <select
                className="w-full border-[#7DA0CA]/50 rounded-xl shadow-2xs focus:ring-2 focus:ring-[#0090FF] focus:border-transparent p-2.5 border bg-[#f8fbfe] text-sm font-medium text-slate-800 transition-colors"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
              >
                {examinations.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.type} - {e.term}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#052659] mb-1.5">
                Select Subject
              </label>
              <select
                className="w-full border-[#7DA0CA]/50 rounded-xl shadow-2xs focus:ring-2 focus:ring-[#0090FF] focus:border-transparent p-2.5 border bg-[#f8fbfe] text-sm font-medium text-slate-800 transition-colors"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subjectName} ({s.subjectCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-[#7DA0CA]/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gradient-to-r from-[#052659] via-[#08336e] to-[#0A3670] text-white">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Roll Number</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider w-48">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-10 text-center text-slate-500 font-medium"
                      >
                        No students found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.student._id}
                        className="odd:bg-white even:bg-[#f8fbfe]/70 hover:bg-[#C1E8FF]/20 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-bold text-[#021024]">
                          {row.student.rollNo}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 font-medium">{row.student.name}</td>
                        <td className="px-5 py-3.5">
                          <input
                            type="number"
                            className="w-full border border-[#7DA0CA]/50 rounded-lg px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0090FF] focus:border-transparent font-semibold text-sm transition-all"
                            placeholder="Enter marks"
                            value={row.editedMark}
                            onChange={(e) =>
                              handleMarkChange(row.student._id, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {rows.length > 0 && (
              <div className="bg-[#f8fbfe] border-t border-[#7DA0CA]/30 p-4 flex items-center justify-between">
                <div>
                  {saveMessage && (
                    <span
                      className={`text-sm font-semibold ${saveMessage.type === "success" ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {saveMessage.text}
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="default"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
