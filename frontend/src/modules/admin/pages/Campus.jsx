import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
} from "@/components/common";
import { campusService } from "@/services/campusService";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Campus = () => {
  const [campuses, setCampuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  // Track if we are editing an existing item
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
  });

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [campusToDelete, setCampusToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await campusService.getAllCampuses();
      setCampuses(data);
    } catch (err) {
      setError(err.message || "Failed to load campuses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = () => {
    setEditId(null);
    setFormData({ name: "", code: "", location: "" });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (campus) => {
    setEditId(campus._id);
    setFormData({
      name: campus.name || "",
      code: campus.code || "",
      location: campus.location || "",
    });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.name.trim()) {
      setSaveError("Campus Name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        location: formData.location.trim(),
        status: "ACTIVE",
      };

      if (editId) {
        await campusService.updateCampus(editId, payload);
      } else {
        await campusService.createCampus(payload);
      }
      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      setSaveError(
        err.message ||
          `Failed to ${editId ? "update" : "create"} campus. Please try again.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (campus) => {
    setCampusToDelete(campus);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campusToDelete) return;
    setIsDeleting(true);
    try {
      await campusService.deleteCampus(campusToDelete._id);
      setIsDeleteDialogOpen(false);
      setCampusToDelete(null);
      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete campus. It may be referenced by other records.",
      );
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Campus Management"
          description="Manage university campuses and locations."
        />

        <button
          onClick={handleOpenDialog}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Campus
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <DataTable
          data={campuses}
          columns={[
            { header: "Campus Name", cell: (row) => row.name },
            { header: "Code", cell: (row) => row.code },
            { header: "Location", cell: (row) => row.location || "-" },
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEdit(row)}
                    className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(row)}
                    className="flex items-center gap-1 text-sm text-rose-500 hover:underline font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage="No campuses found."
        />
      )}

      {/* Campus Creation/Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Campus" : "Add New Campus"}
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
                Campus Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Main Campus"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g. MC"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g. New York, NY"
                disabled={isSaving}
              />
            </div>

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
                    ? "Update Campus"
                    : "Save Campus"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}
        title="Delete Campus"
        description={`Are you sure you want to delete ${campusToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </>
  );
};
