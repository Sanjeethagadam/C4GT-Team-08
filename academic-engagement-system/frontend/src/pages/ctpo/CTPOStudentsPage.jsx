import React, { useState, useEffect } from "react";
import { getStudents, getStudentById } from "../../api/students.api";
import { getStudentMidMarks } from "../../api/midMarks.api";
import { LoadingState, TableSkeleton } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import {
  Search,
  Users,
  Eye,
  X,
  Award,
  BookOpen,
  Calendar,
  Building,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  Mail,
  Phone,
} from "lucide-react";

export const CTPOStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [selectedSection, setSelectedSection] = useState("ALL");
  const [sortBy, setSortBy] = useState("rollNo"); // 'rollNo', 'name', 'backlogs'

  // Student Detail Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [studentMarks, setStudentMarks] = useState([]);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudents();
      if (res.success && Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        throw new Error(res.message || "Failed to load branch students");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenDetails = async (student) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    try {
      const marksRes = await getStudentMidMarks(student._id);
      if (marksRes.success && marksRes.data?.marks) {
        setStudentMarks(marksRes.data.marks);
      } else if (Array.isArray(marksRes.data)) {
        setStudentMarks(marksRes.data);
      } else {
        setStudentMarks([]);
      }
    } catch (err) {
      console.warn("Could not fetch student marks for modal:", err.message);
      setStudentMarks([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
    setStudentMarks([]);
  };

  // Derive unique semesters & sections from real student data for filtering
  const availableSemesters = Array.from(
    new Set(
      students
        .map((s) => s.semesterId?.semesterCode || (s.semesterId?.semesterNumber ? `Semester ${s.semesterId.semesterNumber}` : null))
        .filter(Boolean)
    )
  );

  const availableSections = Array.from(
    new Set(
      students
        .map((s) => s.sectionId?.sectionName || s.sectionId?.name || s.section)
        .filter(Boolean)
    )
  );

  // Filtered & sorted student list
  const filteredStudents = students
    .filter((s) => {
      const rollNo = s.rollNo || s.rollNumber || "";
      const matchSearch =
        rollNo.toLowerCase().includes(search.toLowerCase()) ||
        s.name?.toLowerCase().includes(search.toLowerCase());

      const semCode = s.semesterId?.semesterCode || (s.semesterId?.semesterNumber ? `Semester ${s.semesterId.semesterNumber}` : null);
      const matchSem = selectedSemester === "ALL" || semCode === selectedSemester;

      const secName = s.sectionId?.sectionName || s.sectionId?.name || s.section;
      const matchSec = selectedSection === "ALL" || secName === selectedSection;

      return matchSearch && matchSem && matchSec;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "backlogs") {
        const aBacklogs = a.backlogCount ?? a.backlogs?.count ?? 0;
        const bBacklogs = b.backlogCount ?? b.backlogs?.count ?? 0;
        return bBacklogs - aBacklogs;
      }
      // default: rollNo
      const aRoll = a.rollNo || a.rollNumber || "";
      const bRoll = b.rollNo || b.rollNumber || "";
      return aRoll.localeCompare(bRoll);
    });

  if (loading) {
    return <LoadingState message="Loading students assigned to your branch..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStudents} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">Students</h1>
          <p className="text-sm sm:text-[15px] text-slate-500 mt-0.5">
            Students assigned to your branch
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="academic" size="md">
            <Users className="w-4 h-4" />
            <span>{students.length} Enrolled Students</span>
          </Badge>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Roll Number or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="academic-input pl-10 text-[15px]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {availableSemesters.length > 0 && (
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-academic-500/20 cursor-pointer"
            >
              <option value="ALL">All Semesters</option>
              {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          )}

          {availableSections.length > 0 && (
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-academic-500/20 cursor-pointer"
            >
              <option value="ALL">All Sections</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-academic-500/20 cursor-pointer"
          >
            <option value="rollNo">Sort: Roll Number</option>
            <option value="name">Sort: Name</option>
            <option value="backlogs">Sort: Backlogs (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Modern Data Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found."
          description={search ? `No branch students matching "${search}"` : "There are currently no students assigned to your branch in the database."}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm sm:text-[15px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-sm font-semibold text-slate-600">
                  <th className="py-3.5 px-4 sm:px-6">Roll Number</th>
                  <th className="py-3.5 px-4 sm:px-6">Student Name</th>
                  <th className="py-3.5 px-4">Branch</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Backlogs</th>
                  <th className="py-3.5 px-4">Mid Marks</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const rollNo = student.rollNo || student.rollNumber || "N/A";
                  const branchCode = student.branchId?.code || student.branch?.code || "Branch";
                  const sectionName = student.sectionId?.sectionName || student.sectionId?.name || student.section || "A";
                  const semCode = student.semesterId?.semesterCode || (student.semesterId?.semesterNumber ? `Sem ${student.semesterId.semesterNumber}` : "4-1");
                  const backlogs = student.backlogCount ?? student.backlogs?.count ?? (student.backlogs?.details?.length ?? 0);
                  const isEvaluated = student.midMarksEvaluated || student.evaluated || false;

                  return (
                    <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900">
                        {rollNo}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800">
                        {student.name || "Student"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="academic" size="md">{branchCode}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        Section {sectionName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {semCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={backlogs > 0 ? "danger" : "success"} size="md">
                          {backlogs === 0 ? "0 Backlogs" : `${backlogs} Backlogs`}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isEvaluated ? "success" : "neutral"} size="md">
                          {isEvaluated ? "Evaluated" : "Pending"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleOpenDetails(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-academic-800 hover:text-white text-slate-700 text-sm font-semibold transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Detail View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-academic-100 border border-academic-200 text-academic-800 flex items-center justify-center font-bold text-base">
                  {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedStudent.name || "Student Profile"}
                  </h3>
                  <p className="text-sm text-slate-500 font-mono">
                    {selectedStudent.rollNo || selectedStudent.rollNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetails}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Academic Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Branch</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {selectedStudent.branchId?.code || selectedStudent.branch?.code || "Branch"}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Section</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    Section {selectedStudent.sectionId?.sectionName || selectedStudent.sectionId?.name || selectedStudent.section || "A"}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Semester</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {selectedStudent.semesterId?.semesterCode || (selectedStudent.semesterId?.semesterNumber ? `Sem ${selectedStudent.semesterId.semesterNumber}` : "4-1")}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Backlogs</p>
                  <p className={`text-base font-bold mt-0.5 ${(selectedStudent.backlogCount ?? 0) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {selectedStudent.backlogCount ?? selectedStudent.backlogs?.count ?? 0}
                  </p>
                </div>
              </div>

              {/* Mid Marks Status from live backend query */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                    Mid Marks Evaluation Record
                  </h4>
                  <Badge variant="academic" size="sm">
                    {studentMarks.length} Records
                  </Badge>
                </div>

                {detailLoading ? (
                  <div className="py-6 text-center text-sm text-slate-500">
                    Loading recorded marks...
                  </div>
                ) : studentMarks.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-sm text-slate-500">
                    No mid marks entered yet for this student.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                          <th className="py-2.5 px-3.5">Subject</th>
                          <th className="py-2.5 px-3.5">Examination</th>
                          <th className="py-2.5 px-3.5 text-right">Marks Obtained</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentMarks.map((m, idx) => (
                          <tr key={m._id || idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3.5 font-medium text-slate-800">
                              {m.subjectId?.name || m.subjectId?.subjectName || m.subjectId?.code || "Subject"}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <Badge variant="brand" size="sm">
                                {m.midExam || "MID-1"}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">
                              {m.marksObtained ?? m.marks ?? "—"} / {m.maxMarks || 30}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={handleCloseDetails}
                className="academic-button-primary px-5 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTPOStudentsPage;
