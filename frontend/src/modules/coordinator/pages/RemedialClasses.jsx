import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
  ConfirmDialog,
} from "@/components/common";
import { remedialService } from "@/services/remedialService";
import { Plus, CheckSquare, CheckCircle, Trash2, X, Edit } from "lucide-react";
import { format } from "date-fns";
import { apiClient } from "@/services/apiClient";
import { AttendanceModal } from "../components/AttendanceModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const RemedialClasses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [attendanceSessionId, setAttendanceSessionId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    subjectId: "",
    customSubjectName: "",
    topic: "",
    facultyName: "",
    targetBranch: "",
    targetYear: "",
    targetSemester: "",
    targetSection: "",
  });

  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [loadingEligible, setLoadingEligible] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const getBase = () =>
        apiClient.defaults.baseURL?.replace("/v1", "") || "/api";
      const [data, subRes, branchRes] = await Promise.all([
        remedialService.getAllRemedialClasses(),
        apiClient.get(`${getBase()}/subjects`),
        apiClient.get(`${getBase()}/branches`),
      ]);
      setClasses(data);
      setSubjects(subRes.data || []);
      setBranches(branchRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load remedial classes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fetchEligibleStudents = async () => {
    if (!formData.subjectId) {
      setEligibleStudents([]);
      return;
    }
    setLoadingEligible(true);
    try {
      const students = await remedialService.getEligibleStudents({
        subjectId: formData.subjectId,
        targetYear: formData.targetYear
          ? Number(formData.targetYear)
          : undefined,
        targetBranch: formData.targetBranch || undefined,
        targetSection: formData.targetSection || undefined,
      });
      setEligibleStudents(students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEligible(false);
    }
  };

  useEffect(() => {
    fetchEligibleStudents();
  }, [formData.subjectId, formData.targetYear, formData.targetBranch, formData.targetSection]);

  const StatusBadge = ({ status }) => {
    let color = "bg-slate-100 text-slate-800";
    if (status === "COMPLETED") color = "bg-emerald-100 text-emerald-800";
    if (status === "PENDING" || status === "SCHEDULED")
      color = "bg-amber-100 text-amber-800";
    if (status === "CANCELLED") color = "bg-rose-100 text-rose-800";
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {status || "SCHEDULED"}
      </span>
    );
  };

  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setFormData({
      date: "",
      startTime: "",
      endTime: "",
      venue: "",
      subjectId: "",
      customSubjectName: "",
      topic: "",
      facultyName: "",
      targetBranch: "",
      targetYear: "",
      targetSemester: "",
      targetSection: "",
    });
    setEditingId(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.startTime >= formData.endTime) {
      alert("End time must be later than start time.");
      return;
    }

    if (eligibleStudents.length === 0) {
      alert(
        "No eligible backlog students found. Cannot schedule empty session.",
      );
      return;
    }

    try {
      const payload = {
        ...formData,
        subjectId: formData.subjectId || undefined,
        customSubjectName: formData.customSubjectName || undefined,
        targetBranch: formData.targetBranch || undefined,
        targetYear: formData.targetYear
          ? Number(formData.targetYear)
          : undefined,
        targetSemester: formData.targetSemester
          ? Number(formData.targetSemester)
          : undefined,
        targetSection: formData.targetSection
          ? formData.targetSection
          : undefined,
        // eligibleStudentIds are calculated on the backend
      };
      if (editingId) {
        await remedialService.updateRemedialClass(editingId, payload);
      } else {
        await remedialService.createRemedialClass(payload);
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          `Failed to ${editingId ? "update" : "schedule"} session`,
      );
    }
  };

  const handleComplete = async (row) => {
    if (!window.confirm(`Mark session "${row.topic}" as completed?`)) return;
    try {
      const payload = {
        date: row.date,
        startTime: row.startTime,
        endTime: row.endTime,
        venue: row.venue,
        subjectId: row.subjectId?._id || row.subjectId,
        customSubjectName: row.customSubjectName,
        topic: row.topic,
        facultyName: row.facultyName,
        targetBranch: row.targetBranch?._id || row.targetBranch,
        targetYear: row.targetYear,
        targetSemester: row.targetSemester,
        targetSection: row.targetSection?._id || row.targetSection,
        status: "COMPLETED",
      };
      await remedialService.updateRemedialClass(row._id, payload);
      loadData();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Failed to mark session as completed",
      );
    }
  };

  const handleEdit = (row) => {
    setFormData({
      date: row.date ? new Date(row.date).toISOString().split("T")[0] : "",
      startTime: row.startTime || "",
      endTime: row.endTime || "",
      venue: row.venue || "",
      subjectId: row.subjectId?._id || row.subjectId || "",
      customSubjectName: row.customSubjectName || "",
      topic: row.topic || "",
      facultyName: row.facultyName || "",
      targetBranch: row.targetBranch?._id || row.targetBranch || "",
      targetYear: row.targetYear?.toString() || "",
      targetSemester: row.targetSemester?.toString() || "",
      targetSection: row.targetSection?.toString() || "",
    });
    setEditingId(row._id);
    setIsDialogOpen(true);
  };

  const finalEligibleList = eligibleStudents;

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Remedial Classes"
          description="Manage subject-specific academic support sessions for ACTIVE backlog students."
        />

        <button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <DataTable
          data={classes}
          columns={[
            {
              header: "Subject",
              cell: (row) => (
                <span className="font-semibold text-slate-800">
                  {row.subjectId?.subjectName ||
                    row.customSubjectName ||
                    "Unknown"}
                </span>
              ),
            },
            { header: "Faculty", cell: (row) => row.facultyName },
            { header: "Topic", cell: (row) => row.topic || "No topic" },
            {
              header: "Date",
              cell: (row) =>
                row.date ? format(new Date(row.date), "MMM dd, yyyy") : "-",
            },
            {
              header: "Time",
              cell: (row) =>
                row.startTime
                  ? `${formatTime(row.startTime)} - ${formatTime(row.endTime)}`
                  : "-",
            },
            {
              header: "Eligible",
              cell: (row) => (
                <span className="font-medium">
                  {row.eligibleStudentIds?.length || 0}
                </span>
              ),
            },
            {
              header: "Status",
              cell: (row) => <StatusBadge status={row.status || "SCHEDULED"} />,
            },
            {
              header: "Actions",
              cell: (row) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setAttendanceSessionId({
                        id: row._id,
                        type: "RemedialClass",
                        title: `Attendance: ${row.subjectId?.subjectName || row.customSubjectName}`,
                      })
                    }
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Mark Attendance"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                  {row.status !== "COMPLETED" && (
                    <button
                      onClick={() => handleComplete(row)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Mark as Completed"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(row)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                    title="Edit Class"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(row._id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage="No remedial classes found."
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Cancel Remedial Class"
        description="Are you sure you want to cancel and delete this remedial session? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isConfirming={isDeleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          try {
            await remedialService.deleteRemedialClass(deleteTarget);
            await loadData();
            setDeleteTarget(null);
          } catch (err) {
            alert(err.message || "Failed to delete remedial class");
          } finally {
            setIsDeleting(false);
          }
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl bg-white p-0 gap-0 overflow-hidden rounded-xl border border-[#7DA0CA]/40 shadow-xl max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-[#7DA0CA]/25 bg-[#052659] text-white flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-base font-bold text-white">
              Schedule Remedial Session
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDialogOpen(false)}
              className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <div className="p-6 flex-1 overflow-y-auto bg-[#f4f9fd]/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form
                onSubmit={handleCreate}
                className="space-y-4 flex flex-col h-full bg-white p-5 rounded-xl border border-[#7DA0CA]/30 shadow-xs"
              >
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-bold text-[#021024]">
                      Subject
                    </Label>
                    <select
                      className="w-full h-10 px-3 text-xs bg-white border border-[#7DA0CA]/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#052659]"
                      value={formData.subjectId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subjectId: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        -- Select Subject (Triggers Backlog Search) --
                      </option>
                      {subjects.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.subjectName} ({s.subjectCode})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#5483B3]">
                      Select a subject to automatically find ACTIVE backlog students.
                    </p>
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-bold text-[#021024]">
                      Topic
                    </Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Unit 3 Problem Solving"
                      className="h-10 text-xs bg-white border-[#7DA0CA]/40 rounded-lg"
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData({ ...formData, topic: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#021024]">
                      Date
                    </Label>
                    <Input
                      type="date"
                      required
                      className="h-10 text-xs bg-white border-[#7DA0CA]/40 rounded-lg"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#021024]">
                      Venue
                    </Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Hall A-204"
                      className="h-10 text-xs bg-white border-[#7DA0CA]/40 rounded-lg"
                      value={formData.venue}
                      onChange={(e) =>
                        setFormData({ ...formData, venue: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#021024]">
                      Start Time
                    </Label>
                    <Input
                      type="time"
                      required
                      className="h-10 text-xs bg-white border-[#7DA0CA]/40 rounded-lg"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#021024]">
                      End Time
                    </Label>
                    <Input
                      type="time"
                      required
                      className="h-10 text-xs bg-white border-[#7DA0CA]/40 rounded-lg"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endTime: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-bold text-[#021024]">
                      Faculty In-charge
                    </Label>
                    <Input
                      type="text"
                      placeholder="Assigned Faculty Name"
                      className="h-10 text-xs bg-white border-[#7DA0CA]/40 rounded-lg"
                      value={formData.facultyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          facultyName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5 pt-2">
                    <Label className="text-xs font-bold text-[#021024]">
                      Target Branch
                    </Label>
                    <select
                      className="w-full h-10 px-3 text-xs bg-white border border-[#7DA0CA]/40 rounded-lg focus:outline-none"
                      value={formData.targetBranch}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetBranch: e.target.value,
                        })
                      }
                    >
                      <option value="">All Branches</option>
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#021024]">
                      Target Year
                    </Label>
                    <select
                      className="w-full h-10 px-3 text-xs bg-white border border-[#7DA0CA]/40 rounded-lg focus:outline-none"
                      value={formData.targetYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetYear: e.target.value,
                        })
                      }
                    >
                      <option value="">All Years</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#021024]">
                      Target Section
                    </Label>
                    <Input
                      type="text"
                      className="h-10 text-xs bg-white border-[#7DA0CA]/40 rounded-lg"
                      value={formData.targetSection}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetSection: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-bold text-[#021024]">
                      Target Semester
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="2"
                      className="h-10 text-xs bg-white border-[#7DA0CA]/40 rounded-lg"
                      value={formData.targetSemester}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetSemester: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#7DA0CA]/20 mt-auto">
                  <Button
                    type="submit"
                    className="w-full bg-[#052659] hover:bg-[#021024] text-white text-xs font-semibold h-10 shadow-xs"
                  >
                    Schedule Session
                  </Button>
                </div>
              </form>

              <div className="bg-white border border-[#7DA0CA]/35 rounded-xl p-5 flex flex-col h-full max-h-[620px] shadow-xs">
                <h3 className="font-bold text-sm text-[#021024] mb-1">
                  Eligible Roster Preview
                </h3>
                <div className="text-xs text-[#5483B3] mb-3 pb-3 border-b border-[#7DA0CA]/20">
                  Automatically matches students with an ACTIVE backlog in the
                  selected subject.
                </div>

                {loadingEligible ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-[#5483B3] font-medium">
                    Loading eligible roster...
                  </div>
                ) : !formData.subjectId ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-[#5483B3] font-medium text-center p-4">
                    Select a subject to view eligible students.
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-xs font-semibold text-[#021024]">
                        Target Count:{" "}
                        <span className="text-[#052659] font-bold">
                          {finalEligibleList.length}
                        </span>
                      </span>
                    </div>
                    <div className="flex-1 overflow-auto border border-[#7DA0CA]/30 rounded-lg">
                      <Table>
                        <TableHeader className="bg-[#052659]/5 sticky top-0 z-10 border-b border-[#7DA0CA]/25">
                          <TableRow>
                            <TableHead className="text-[#052659] font-bold text-xs uppercase py-2.5">
                              HTNO / Name
                            </TableHead>
                            <TableHead className="text-[#052659] font-bold text-xs uppercase py-2.5">
                              Branch
                            </TableHead>
                            <TableHead className="text-[#052659] font-bold text-xs uppercase py-2.5">
                              Year
                            </TableHead>
                            <TableHead className="text-[#052659] font-bold text-xs uppercase py-2.5 text-center">
                              Backlogs
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {finalEligibleList.map((s) => (
                            <TableRow
                              key={s._id}
                              className="border-b border-[#7DA0CA]/15 hover:bg-[#C1E8FF]/20"
                            >
                              <TableCell className="p-2.5">
                                <div className="font-mono text-xs font-semibold text-[#021024]">
                                  {s.rollNo}
                                </div>
                                <div className="text-[11px] text-[#5483B3]">
                                  {s.name}
                                </div>
                              </TableCell>
                              <TableCell className="p-2.5 text-xs font-medium text-[#021024]">
                                {s.branchId?.code}
                              </TableCell>
                              <TableCell className="p-2.5 text-xs text-[#5483B3]">
                                Y{s.year}
                              </TableCell>
                              <TableCell className="p-2.5 text-center font-bold text-rose-600 bg-rose-50/50 text-xs">
                                {s.activeBacklogCount || 1}
                              </TableCell>
                            </TableRow>
                          ))}
                          {finalEligibleList.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="p-6 text-center text-xs text-slate-400 italic"
                              >
                                No eligible active backlog students found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {attendanceSessionId && (
        <AttendanceModal
          isOpen={true}
          onClose={() => setAttendanceSessionId(null)}
          referenceId={attendanceSessionId.id}
          referenceType={attendanceSessionId.type}
          title={attendanceSessionId.title}
        />
      )}
    </>
  );
};
