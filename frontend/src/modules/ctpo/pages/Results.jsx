import React, { useEffect, useState, useMemo } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  StatusBadge,
} from "@/components/common";
import { ctpoService } from "@/services/ctpoService";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getAvailableSemesters = (year) => {
  const y = String(year);
  if (y === "4") return ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2"];
  if (y === "3") return ["1-1", "1-2", "2-1", "2-2"];
  if (y === "2") return ["1-1", "1-2"];
  return ["1-1"]; // default for year 1 or fallback
};

export const Results = () => {
  const [results, setResults] = useState([]);
  const [ctpoYear, setCtpoYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedSemester, setSelectedSemester] = useState("");

  const loadData = async (semester) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ctpoService.getResults(semester);
      if (data && data.year) {
        setCtpoYear(data.year);
        setResults(data.results || []);
        if (!semester) {
          // Initial load: we just got the year. Now set the default semester.
          const availableSemesters = getAvailableSemesters(data.year);
          if (availableSemesters.length > 0) {
            setSelectedSemester(
              availableSemesters[availableSemesters.length - 1],
            );
          }
        }
      } else {
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message || "Failed to load class results");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSemester) {
      loadData(selectedSemester);
    } else {
      loadData();
    }
  }, [selectedSemester]);

  const toggleRow = (studentId) => {
    setExpandedRows((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const availableSemesters = useMemo(
    () => getAvailableSemesters(ctpoYear),
    [ctpoYear],
  );

  // Group by student for selected semester
  const groupedResults = useMemo(() => {
    const map = {};
    // Filter results by selected semester
    const filteredResults = results.filter(
      (r) => r.semesterId?.semesterCode === selectedSemester,
    );
    filteredResults.forEach((r) => {
      const sId = r.studentId?._id;
      if (!sId) return;

      if (!map[sId]) {
        map[sId] = {
          student: r.studentId,
          results: [],
          overallStatus: "PASS",
        };
      }
      const existingResults = map[sId].results;
      const isDuplicate = existingResults.some((existing) => {
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
          existing.subjectId._id === r.subjectId._id;
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
        map[sId].results.push(r);
        if (r.resultStatus === "FAIL" || r.resultStatus === "ABSENT") {
          map[sId].overallStatus = "FAIL";
        }
      }
    });

    return Object.values(map).sort((a, b) =>
      a.student.rollNo.localeCompare(b.student.rollNo),
    );
  }, [results, selectedSemester]);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Results"
        description="Official university semester results for your class."
      />

      <div className="bg-white p-4 rounded-xl shadow-xs border border-[#E5E0F5] flex items-center justify-between">
        <h3 className="font-medium text-[#1F1B2D]">Select Semester</h3>
        <select
          className="border border-[#E5E0F5] rounded-md px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          {availableSemesters.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-[#E5E0F5] overflow-hidden">
        {groupedResults.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No official university result data available for this semester.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Total Subjects</TableHead>
                <TableHead>Overall Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedResults.map(
                ({ student, results: studentResults, overallStatus }) => {
                  const isExpanded = expandedRows[student._id];
                  return (
                    <React.Fragment key={student._id}>
                      <TableRow
                        className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                        onClick={() => toggleRow(student._id)}
                      >
                        <TableCell className="p-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">
                          {student.rollNo}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{studentResults.length}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={
                              overallStatus === "PASS" ? "success" : "danger"
                            }
                            label={overallStatus}
                          />
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                          <TableCell colSpan={5} className="p-0 border-b">
                            <div className="p-4 pl-12">
                              <Table className="bg-white border rounded-md overflow-hidden shadow-sm">
                                <TableHeader className="bg-slate-100">
                                  <TableRow>
                                    <TableHead className="py-2">
                                      Subject
                                    </TableHead>
                                    <TableHead className="py-2">
                                      Grade
                                    </TableHead>
                                    <TableHead className="py-2">
                                      Grade Point
                                    </TableHead>
                                    <TableHead className="py-2">
                                      Credits
                                    </TableHead>
                                    <TableHead className="py-2">
                                      Status
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {studentResults.map((r) => (
                                    <TableRow key={r._id}>
                                      <TableCell className="py-2">
                                        {r.subjectId?.subjectName}
                                      </TableCell>
                                      <TableCell className="py-2 font-medium">
                                        {r.grade || "-"}
                                      </TableCell>
                                      <TableCell className="py-2">
                                        {r.gradePoint !== undefined &&
                                        r.gradePoint !== null
                                          ? r.gradePoint
                                          : "-"}
                                      </TableCell>
                                      <TableCell className="py-2">
                                        {r.credits !== undefined
                                          ? r.credits
                                          : "-"}
                                      </TableCell>
                                      <TableCell className="py-2">
                                        <StatusBadge
                                          status={
                                            r.resultStatus === "PASS"
                                              ? "success"
                                              : r.resultStatus === "FAIL"
                                                ? "danger"
                                                : "warning"
                                          }
                                          label={r.resultStatus}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                },
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
