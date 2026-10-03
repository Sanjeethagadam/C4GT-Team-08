import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
} from "@/components/common";
import { branchService } from "@/services/branchService";
import { Plus, Loader2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  // Track edit state
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "" });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await branchService.getAllBranches();
      setBranches(data);
    } catch (err) {
      setError(err.message || "Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = () => {
    setEditId(null);
    setFormData({ name: "", code: "" });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (branch) => {
    setEditId(branch._id);
    setFormData({
      name: branch.name || "",
      code: branch.code || "",
    });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.name.trim()) {
      setSaveError("Branch Name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        status: "ACTIVE",
      };

      if (editId) {
        await branchService.updateBranch(editId, payload);
      } else {
        await branchService.createBranch(payload);
      }
      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      setSaveError(
        err.message ||
          `Failed to ${editId ? "update" : "create"} branch. Please try again.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Branch Management"
          description="Manage academic branches and campus availability."
        />

        <button
          onClick={handleOpenDialog}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <DataTable
          data={branches}
          columns={[
            { header: "Branch Name", cell: (row) => row.name },
            { header: "Code", cell: (row) => row.code },
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
          emptyMessage="No branches found."
        />
      )}

      {/* Branch Creation/Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Branch" : "Add New Branch"}
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
                Branch Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Computer Science and Engineering"
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
                placeholder="e.g. CSE"
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
                    ? "Update Branch"
                    : "Save Branch"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
