import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
} from "@/components/common";
import { apiClient } from "@/services/apiClient";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";

export const AttendanceProgress = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  const handleViewProgress = async (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    setIsHistoryLoading(true);
    try {
      const response = await apiClient.get(
        `/academic-support/attendance/history/${student._id}`,
      );
      setHistory(response.data || []);
    } catch (err) {
      console.error("Failed to load history", err);
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      if (branchFilter) params.append("branch", branchFilter);
      if (yearFilter) params.append("year", yearFilter);

      const response = await apiClient.get(
        `/academic-support/attendance/progress/all?${params.toString()}`,
      );
      setStudents(response.data || []);
      if (response.pagination) {
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      setError(err.message || "Failed to load attendance records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit, search, branchFilter, yearFilter]);

  const formatTimeAMPM = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const filteredHistory = history.filter(
    (h) => filter === "All" || h.type === filter,
  );
  const histTotal = filteredHistory.length;
  const histPresent = filteredHistory.filter((h) => h.present).length;
  const histAbsent = histTotal - histPresent;
  const histPct =
    histTotal > 0 ? Math.round((histPresent / histTotal) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Attendance & Progress"
        description="Track student participation across all remedial and guest lecture sessions."
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or roll no..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchInput);
                  setPage(1);
                }
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Branches</option>
            <option value="CSM">CSM</option>
            <option value="CSD">CSD</option>
            <option value="CSC">CSC</option>
            <option value="CAI">CAI</option>
            <option value="AID">AID</option>
          </select>
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Years</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
          <button
            onClick={() => {
              setSearch(searchInput);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <>
          <DataTable
            data={students}
            columns={[
              {
                header: "Roll Number",
                cell: (row) => row.student?.rollNo || "-",
              },
              {
                header: "Student Name",
                cell: (row) => row.student?.name || "-",
              },
              {
                header: "Branch",
                cell: (row) => row.student?.branchId?.code || "-",
              },
              {
                header: "Year",
                cell: (row) =>
                  row.student?.year ? `Year ${row.student.year}` : "-",
              },
              {
                header: "Total Sessions",
                cell: (row) => row.totalSessions || 0,
              },
              {
                header: "Attendance %",
                cell: (row) => (
                  <span
                    className={`font-medium ${row.attendancePercentage >= 75 ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {row.attendancePercentage || 0}%
                  </span>
                ),
              },
              {
                header: "Actions",
                cell: (row) => (
                  <button
                    onClick={() => handleViewProgress(row.student)}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    View Progress
                  </button>
                ),
              },
            ]}
            emptyMessage="No student attendance records found."
          />

          {total > 0 && (
            <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * limit, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span> records
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-sm font-medium px-4 py-2 bg-slate-50 rounded-lg border">
                  Page {page} of {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                Progress History: {selectedStudent?.name} (
                {selectedStudent?.rollNo})
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-3 bg-slate-50 border-b flex justify-between items-center shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("All")}
                  className={`px-3 py-1 text-sm rounded ${filter === "All" ? "bg-primary text-white" : "bg-white border text-slate-600"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("RemedialClass")}
                  className={`px-3 py-1 text-sm rounded ${filter === "RemedialClass" ? "bg-primary text-white" : "bg-white border text-slate-600"}`}
                >
                  Remedial
                </button>
                <button
                  onClick={() => setFilter("GuestLecture")}
                  className={`px-3 py-1 text-sm rounded ${filter === "GuestLecture" ? "bg-primary text-white" : "bg-white border text-slate-600"}`}
                >
                  Guest Lectures
                </button>
              </div>
              <div className="flex gap-4 text-sm font-medium">
                <div className="text-slate-700">Total: {histTotal}</div>
                <div className="text-emerald-600">Present: {histPresent}</div>
                <div className="text-rose-600">Absent: {histAbsent}</div>
                <div className="text-[#7C3AED] font-semibold">Attendance: {histPct}%</div>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {isHistoryLoading ? (
                <div className="py-8 text-center text-slate-500">
                  Loading records...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500 italic">
                  No progress records found for this filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 border-b sticky top-0">
                        <th className="p-3 font-semibold">Type</th>
                        <th className="p-3 font-semibold">Subject</th>
                        <th className="p-3 font-semibold">Topic</th>
                        <th className="p-3 font-semibold">Date</th>
                        <th className="p-3 font-semibold">Time</th>
                        <th className="p-3 font-semibold">Venue</th>
                        <th className="p-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((record, i) => (
                        <tr
                          key={i}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >
                          <td className="p-3">
                            {record.type === "RemedialClass"
                              ? "Remedial"
                              : "Guest Lecture"}
                          </td>
                          <td className="p-3">{record.subject}</td>
                          <td className="p-3">{record.topic}</td>
                          <td className="p-3">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            {formatTimeAMPM(record.startTime)} -{" "}
                            {formatTimeAMPM(record.endTime)}
                          </td>
                          <td className="p-3">{record.venue}</td>
                          <td className="p-3">
                            {record.present ? (
                              <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                Present
                              </span>
                            ) : (
                              <span className="text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded-full">
                                Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
