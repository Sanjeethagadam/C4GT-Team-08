import { useEffect, useState, useCallback } from "react";
import { X, Save, FileDown, Users } from "lucide-react";
import { attendanceService } from "@/services/attendanceService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AttendanceModal = ({
  isOpen,
  onClose,
  referenceId,
  referenceType,
  title,
}) => {
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAttendance(referenceId);
      setSession(data.session);
      setRecords(data.records);
    } catch (err) {
      console.error(err);
      alert(`Failed to load attendance: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [referenceId]);

  useEffect(() => {
    if (isOpen) {
      loadAttendance();
    }
  }, [isOpen, loadAttendance]);

  const handleToggle = (studentId, value) => {
    setRecords(
      records.map((r) =>
        r.studentId._id === studentId ? { ...r, present: value } : r,
      ),
    );
  };

  const markAll = (value) => {
    setRecords(records.map((r) => ({ ...r, present: value })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = records.map((r) => ({
        studentId: r.studentId._id || r.studentId,
        present: r.present,
      }));
      await attendanceService.submitAttendance(
        referenceId,
        referenceType,
        payload,
      );
      alert("Attendance saved successfully");
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Failed to save attendance: ${err?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = () => {
    if (!session) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${title} - Attendance Roster`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Reference ID: ${referenceId}`, 14, 28);
    doc.text(`Reference Type: ${referenceType}`, 14, 34);
    doc.text(
      `Date: ${session.date ? new Date(session.date).toLocaleDateString() : new Date().toLocaleDateString()}`,
      14,
      40,
    );

    const presentCount = records.filter((r) => r.present).length;
    const totalCount = records.length;
    const percentage =
      totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    doc.text(
      `Attendance Stats: ${presentCount}/${totalCount} (${percentage}%)`,
      14,
      46,
    );

    const tableData = records.map((r, idx) => [
      idx + 1,
      r.studentId.rollNo || r.studentId.rollNumber || "-",
      r.studentId.name ||
        r.studentId.firstName + " " + r.studentId.lastName ||
        "-",
      r.studentId.branchId?.code || r.studentId.branchId?.branchCode || "-",
      r.present ? "PRESENT" : "ABSENT",
    ]);

    autoTable(doc, {
      startY: 52,
      head: [["#", "Roll Number", "Name", "Branch", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [5, 38, 89] },
      didParseCell: function (data) {
        if (data.column.index === 4 && data.cell.section === "body") {
          if (data.cell.raw === "PRESENT") {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    doc.save(`Attendance_${title.replace(/\s+/g, "_")}.pdf`);
  };

  const presentCount = records.filter((r) => r.present).length;
  const totalCount = records.length;
  const absentCount = totalCount - presentCount;
  const percentage =
    totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white p-0 gap-0 overflow-hidden rounded-xl border border-[#7DA0CA]/40 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-[#7DA0CA]/25 bg-[#052659] text-white flex flex-row items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-[#C1E8FF]" />
              {title}
            </DialogTitle>
            <p className="text-xs text-[#C1E8FF]/80">
              Record attendance for scheduled student roster
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPdf}
              disabled={loading || !session}
              className="h-8 gap-1.5 rounded-md px-3 bg-white/10 text-white border-[#5483B3]/40 hover:bg-white/20 text-xs font-semibold"
            >
              <FileDown className="w-3.5 h-3.5" /> Export PDF
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Stats Strip */}
        <div className="px-6 py-3 bg-[#f4f9fd] border-b border-[#7DA0CA]/30 flex flex-wrap gap-4 items-center justify-between shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#021024]">
            <div>
              Total: <span className="font-bold text-[#052659]">{totalCount}</span>
            </div>
            <div>
              Present: <span className="font-bold text-emerald-600">{presentCount}</span>
            </div>
            <div>
              Absent: <span className="font-bold text-rose-600">{absentCount}</span>
            </div>
            <div>
              Rate: <span className="font-bold text-[#5483B3]">{percentage}%</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll(true)}
              className="h-7 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            >
              Mark All Present
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll(false)}
              className="h-7 text-xs font-semibold bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
            >
              Mark All Absent
            </Button>
          </div>
        </div>

        {/* Table Roster */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f4f9fd]/40">
          {loading ? (
            <div className="flex justify-center items-center h-48 text-xs font-semibold text-[#5483B3]">
              Loading student roster...
            </div>
          ) : records.length === 0 ? (
            <div className="flex justify-center items-center h-48 text-xs font-medium text-slate-500 bg-white border border-[#7DA0CA]/30 rounded-xl">
              No students enrolled in this session.
            </div>
          ) : (
            <div className="bg-white border border-[#7DA0CA]/35 rounded-xl shadow-xs overflow-hidden">
              <Table>
                <TableHeader className="bg-[#052659]/5 border-b border-[#7DA0CA]/25">
                  <TableRow>
                    <TableHead className="text-[#052659] font-bold text-xs uppercase py-3">
                      Roll Number
                    </TableHead>
                    <TableHead className="text-[#052659] font-bold text-xs uppercase py-3">
                      Name
                    </TableHead>
                    <TableHead className="text-[#052659] font-bold text-xs uppercase py-3">
                      Branch
                    </TableHead>
                    <TableHead className="text-[#052659] font-bold text-xs uppercase py-3 text-center">
                      Present?
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow
                      key={record.studentId._id}
                      className="border-b border-[#7DA0CA]/15 hover:bg-[#C1E8FF]/20"
                    >
                      <TableCell className="font-mono text-xs font-semibold text-[#021024]">
                        {record.studentId.rollNo ||
                          record.studentId.rollNumber ||
                          "-"}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-[#021024]">
                        {record.studentId.name ||
                          record.studentId.firstName +
                            " " +
                            record.studentId.lastName ||
                          "-"}
                      </TableCell>
                      <TableCell className="text-xs text-[#5483B3] font-medium">
                        {record.studentId.branchId?.code ||
                          record.studentId.branchId?.branchCode ||
                          "-"}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={record.present}
                            onCheckedChange={(checked) =>
                              handleToggle(record.studentId._id, !!checked)
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#7DA0CA]/25 bg-white flex justify-end items-center shrink-0 gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-[#7DA0CA]/50 text-[#021024] hover:bg-slate-100 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-[#052659] hover:bg-[#021024] text-white text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
