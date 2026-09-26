import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
} from "@/components/common";
import { academicConfigService } from "@/services/academicConfigService";
import { Plus, Loader2, Pencil, Trash2, ToggleRight, ToggleLeft } from "lucide-react";
import { format } from "date-fns";
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

export const AcademicYears = () => {
  const [years, setYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  // Track edit state
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    academicYear: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await academicConfigService.getAllAcademicYears();
      setYears(data);
    } catch (err) {
      setError(err.message || "Failed to load academic years");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = () => {
    setEditId(null);
    setFormData({
      academicYear: "",
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (year) => {
    setEditId(year._id);
    setFormData({
      academicYear: year.academicYear || "",
      startDate: year.startDate
        ? new Date(year.startDate).toISOString().split("T")[0]
        : "",
      endDate: year.endDate
        ? new Date(year.endDate).toISOString().split("T")[0]
        : "",
      isActive: year.status === "ACTIVE",
    });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.academicYear.trim()) {
      setSaveError("Academic Year is required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        academicYear: formData.academicYear.trim(),
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : undefined,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : undefined,
        status: formData.isActive ? "ACTIVE" : "INACTIVE",
      };

      if (editId) {
        await academicConfigService.updateAcademicYear(editId, payload);
      } else {
        await academicConfigService.createAcademicYear(payload);
      }
      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      setSaveError(
        err.message ||
          `Failed to ${editId ? "update" : "create"} academic year. Please try again.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (year) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          year.status === "ACTIVE" ? "deactivate" : "activate"
        } this academic year?`
      )
    ) {
      return;
    }
    try {
      setActionInProgress(year._id);
      const newStatus = year.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await academicConfigService.updateAcademicYear(year._id, {
        status: newStatus,
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to update status");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRemove = async (year) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this academic year? This action cannot be undone."
      )
    ) {
      return;
    }
    
    try {
      setActionInProgress(year._id);
      await academicConfigService.deleteAcademicYear(year._id);
      await loadData();
    } catch (err) {
      alert(
        err.response?.data?.message || err.message || "Failed to remove academic year"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Academic Years"
          description="Configure global academic year boundaries."
        />

        <button
          onClick={handleOpenDialog}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Year
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <DataTable
          data={years}
          columns={[
            { header: "Year", cell: (row) => row.academicYear },
            {
              header: "Start Date",
              cell: (row) =>
                row.startDate
                  ? format(new Date(row.startDate), "MMM dd, yyyy")
                  : "-",
            },
            {
              header: "End Date",
              cell: (row) =>
                row.endDate
                  ? format(new Date(row.endDate), "MMM dd, yyyy")
                  : "-",
            },
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
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleEdit(row)}
                    disabled={actionInProgress === row._id}
                    className="flex items-center gap-1 text-sm text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(row)}
                    disabled={actionInProgress === row._id}
                    className="flex items-center gap-1 text-sm text-amber-600 hover:underline font-medium disabled:opacity-50"
                  >
                    {row.status === "ACTIVE" ? (
                      <>
                        <ToggleLeft className="w-3.5 h-3.5" /> Deactivate
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-3.5 h-3.5" /> Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRemove(row)}
                    disabled={actionInProgress === row._id}
                    className="flex items-center gap-1 text-sm text-red-600 hover:underline font-medium disabled:opacity-50"
                  >
                    {actionInProgress === row._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Remove
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage="No academic years found."
        />
      )}

      {/* Creation/Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Academic Year" : "Add Academic Year"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {saveError && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-md border border-rose-100">
                {saveError}
              </div>
            )}

            <div className="space-y-2">
              <Label>
                Academic Year <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
                placeholder="e.g. 2026-2027"
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>
            </div>

            {editId && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isActive: Boolean(checked),
                    })
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Is Active?
                </Label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving
                  ? "Saving..."
                  : editId
                    ? "Update Year"
                    : "Save Year"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
