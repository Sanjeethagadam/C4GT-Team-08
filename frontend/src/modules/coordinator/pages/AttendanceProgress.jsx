import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
} from "@/components/common";
import { apiClient } from "@/services/apiClient";
import { X, Search, ChevronLeft, ChevronRight, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl bg-white p-0 gap-0 overflow-hidden rounded-xl border border-[#7DA0CA]/40 shadow-xl max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-[#7DA0CA]/25 bg-[#052659] text-white flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <History className="h-4 w-4 text-[#C1E8FF]" />
              Progress History: {selectedStudent?.name} ({selectedStudent?.rollNo})
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalOpen(false)}
              className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <div className="px-6 py-3 bg-[#f4f9fd] border-b border-[#7DA0CA]/30 flex flex-wrap gap-3 justify-between items-center shrink-0">
            <div className="flex gap-1.5">
              <Button
                variant={filter === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("All")}
                className={`h-7 text-xs font-semibold ${
                  filter === "All"
                    ? "bg-[#052659] text-white"
                    : "border-[#7DA0CA]/40 text-[#021024] bg-white hover:bg-[#C1E8FF]/30"
                }`}
              >
                All
              </Button>
              <Button
                variant={filter === "RemedialClass" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("RemedialClass")}
                className={`h-7 text-xs font-semibold ${
                  filter === "RemedialClass"
                    ? "bg-[#052659] text-white"
                    : "border-[#7DA0CA]/40 text-[#021024] bg-white hover:bg-[#C1E8FF]/30"
                }`}
              >
                Remedial
              </Button>
              <Button
                variant={filter === "GuestLecture" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("GuestLecture")}
                className={`h-7 text-xs font-semibold ${
                  filter === "GuestLecture"
                    ? "bg-[#052659] text-white"
                    : "border-[#7DA0CA]/40 text-[#021024] bg-white hover:bg-[#C1E8FF]/30"
                }`}
              >
                Guest Lectures
              </Button>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-[#021024]">
              <div>Total: <span className="font-bold text-[#052659]">{histTotal}</span></div>
              <div>Present: <span className="font-bold text-emerald-600">{histPresent}</span></div>
              <div>Absent: <span className="font-bold text-rose-600">{histAbsent}</span></div>
              <div>Attendance: <span className="font-bold text-[#5483B3]">{histPct}%</span></div>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto bg-[#f4f9fd]/30">
            {isHistoryLoading ? (
              <div className="py-12 text-center text-xs text-[#5483B3] font-medium">
                Loading attendance history...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-white border border-[#7DA0CA]/30 rounded-xl italic">
                No progress records found for this filter.
              </div>
            ) : (
              <div className="bg-white border border-[#7DA0CA]/35 rounded-xl shadow-xs overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#052659]/5 border-b border-[#7DA0CA]/25">
                    <TableRow>
                      <TableHead className="text-[#052659] font-bold text-xs uppercase py-3">Type</TableHead>
                      <TableHead className="text-[#052659] font-bold text-xs uppercase py-3">Subject</TableHead>
                      <TableHead className="text-[#052659] font-bold text-xs uppercase py-3">Topic</TableHead>
                      <TableHead className="text-[#052659] font-bold text-xs uppercase py-3">Date</TableHead>
                      <TableHead className="text-[#052659] font-bold text-xs uppercase py-3">Time</TableHead>
                      <TableHead className="text-[#052659] font-bold text-xs uppercase py-3">Venue</TableHead>
                      <TableHead className="text-[#052659] font-bold text-xs uppercase py-3 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((record, i) => (
                      <TableRow
                        key={i}
                        className="border-b border-[#7DA0CA]/15 hover:bg-[#C1E8FF]/20"
                      >
                        <TableCell className="text-xs font-semibold text-[#021024]">
                          {record.type === "RemedialClass" ? "Remedial" : "Guest Lecture"}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-[#021024]">{record.subject}</TableCell>
                        <TableCell className="text-xs text-[#5483B3]">{record.topic}</TableCell>
                        <TableCell className="text-xs text-[#021024]">
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-[#5483B3] whitespace-nowrap">
                          {formatTimeAMPM(record.startTime)} - {formatTimeAMPM(record.endTime)}
                        </TableCell>
                        <TableCell className="text-xs text-[#021024]">{record.venue}</TableCell>
                        <TableCell className="text-center py-2">
                          {record.present ? (
                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                              Present
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 text-[10px] font-semibold">
                              Absent
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
