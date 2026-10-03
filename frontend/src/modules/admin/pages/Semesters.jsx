import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
} from "@/components/common";
import { academicConfigService } from "@/services/academicConfigService";
import { Plus, Loader2, Pencil, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Semesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  // Track edit state
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    academicYearId: "",
    semesterCode: "",
    isActive: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [semestersData, yearsData] = await Promise.all([
        academicConfigService.getAllSemesters(),
        academicConfigService.getAllAcademicYears(),
      ]);
      // Sort to group by Academic Year, then sequence by Term
      semestersData.sort((a, b) => {
        const yearA = a.academicYearId?.academicYear || "";
        const yearB = b.academicYearId?.academicYear || "";
        if (yearA !== yearB) {
          return yearA.localeCompare(yearB);
        }
        return (a.semesterCode || "").localeCompare(b.semesterCode || "");
      });

      setSemesters(semestersData);
      setAcademicYears(yearsData);
    } catch (err) {
      setError(err.message || "Failed to load semesters");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = () => {
    setEditId(null);
    setFormData({ academicYearId: "", semesterCode: "", isActive: true });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (semester) => {
    setEditId(semester._id);
    setFormData({
      academicYearId:
        typeof semester.academicYearId === "string"
          ? semester.academicYearId
          : semester.academicYearId?._id || "",
      semesterCode: semester.semesterCode || "",
      isActive: semester.status === "ACTIVE",
    });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.academicYearId) {
      setSaveError("Academic Year is required.");
      return;
    }
    if (!formData.semesterCode.trim()) {
      setSaveError("Term is required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        academicYearId: formData.academicYearId,
        semesterCode: formData.semesterCode.trim(),
        status: formData.isActive ? "ACTIVE" : "INACTIVE",
      };

      if (editId) {
        await academicConfigService.updateSemester(editId, payload);
      } else {
        await academicConfigService.createSemester(payload);
      }
      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      setSaveError(
        err.message ||
          `Failed to ${editId ? "update" : "create"} semester. Please try again.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Semesters Configuration"
          description="Manage academic terms/semesters within academic years."
        />

        <button
          onClick={handleOpenDialog}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Semester
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <DataTable
          data={semesters}
          columns={[
            {
              header: "Academic Year",
              cell: (row) => row.academicYearId?.academicYear || "-",
            },
            { header: "Term", cell: (row) => row.semesterCode },
            {
              header: "Status",
              cell: (row) => (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"}`}
                >
                  {row.status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "Actions",
              cell: (row) => (
                <button
                  onClick={() => handleEdit(row)}
                  className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              ),
            },
          ]}
          emptyMessage="No semesters found."
        />
      )}

      {/* Creation/Edit Modal via shadcn Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white p-0 gap-0 overflow-hidden rounded-xl border border-[#7DA0CA]/40 shadow-xl">
          <DialogHeader className="px-6 py-4 border-b border-[#7DA0CA]/25 bg-[#052659] text-white flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-bold text-white">
              {editId ? "Edit Academic Semester" : "Add Academic Semester"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => !isSaving && setIsDialogOpen(false)}
              disabled={isSaving}
              className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {saveError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-lg border border-rose-200">
                {saveError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#021024]">
                Academic Year <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.academicYearId}
                onChange={(e) =>
                  setFormData({ ...formData, academicYearId: e.target.value })
                }
                className="w-full h-10 px-3 text-xs border border-[#7DA0CA]/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#052659] bg-white"
                disabled={isSaving}
              >
                <option value="">-- Select Academic Year --</option>
                {academicYears.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.academicYear}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#021024]">
                Semester / Code <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.semesterCode}
                onChange={(e) =>
                  setFormData({ ...formData, semesterCode: e.target.value })
                }
                className="h-10 text-xs border-[#7DA0CA]/40 rounded-lg bg-white"
                placeholder="e.g. 1-1 or Fall 2026"
                disabled={isSaving}
              />
            </div>

            {editId && (
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="semesterIsActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: !!checked })
                  }
                  disabled={isSaving}
                />
                <Label
                  htmlFor="semesterIsActive"
                  className="text-xs font-medium text-[#021024] cursor-pointer"
                >
                  Active for current academic operations
                </Label>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#7DA0CA]/25">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
                className="border-[#7DA0CA]/50 text-[#021024] hover:bg-slate-100 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="bg-[#052659] hover:bg-[#021024] text-white text-xs font-semibold shadow-xs"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {isSaving
                  ? "Saving..."
                  : editId
                    ? "Update Semester"
                    : "Save Semester"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
