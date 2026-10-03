import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
} from "@/components/common";
import { campusBranchLinkService } from "@/services/campusBranchLinkService";
import { campusService } from "@/services/campusService";
import { branchService } from "@/services/branchService";
import { Plus, Loader2, CheckCircle2, AlertCircle, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const CampusBranchLinkPage = () => {
  const [links, setLinks] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    campusId: "",
    branchId: "",
    isAvailable: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [linksData, campusesData, branchesData] = await Promise.all([
        campusBranchLinkService.getAllLinks(),
        campusService.getAllCampuses(),
        branchService.getAllBranches(),
      ]);
      setLinks(linksData);
      setCampuses(campusesData);
      setBranches(branchesData);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = () => {
    setEditId(null);
    setFormData({ campusId: "", branchId: "", isAvailable: true });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (link) => {
    setEditId(link._id);
    setFormData({
      campusId:
        typeof link.campusId === "string"
          ? link.campusId
          : link.campusId?._id || "",
      branchId:
        typeof link.branchId === "string"
          ? link.branchId
          : link.branchId?._id || "",
      isAvailable: link.isAvailable !== false,
    });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleRemove = async (id) => {
    if (confirm("Are you sure you want to remove this link?")) {
      try {
        await campusBranchLinkService.deleteLink(id);
        await loadData();
      } catch (err) {
        alert(err.message || "Failed to delete link.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.campusId) {
      setSaveError("Please select a Campus.");
      return;
    }
    if (!formData.branchId) {
      setSaveError("Please select a Branch.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        campusId: formData.campusId,
        branchId: formData.branchId,
        isAvailable: formData.isAvailable,
      };

      if (editId) {
        await campusBranchLinkService.updateLink(editId, payload);
      } else {
        await campusBranchLinkService.createLink(payload);
      }
      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      setSaveError(
        err.message ||
          `Failed to ${editId ? "update" : "create"} link. It may already exist.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Campus-Branch Links"
          description="Map academic branches to physical campuses."
        />

        <button
          onClick={handleOpenDialog}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Link Branch to Campus
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <DataTable
          data={links}
          columns={[
            {
              header: "Campus",
              cell: (row) => row.campusId?.name || "-",
            },
            {
              header: "Branch",
              cell: (row) => row.branchId?.name || "-",
            },
            {
              header: "Status",
              cell: (row) => (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${row.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"}`}
                >
                  {row.isAvailable ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {row.isAvailable ? "Available" : "Unavailable"}
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
                    onClick={() => handleRemove(row._id)}
                    className="text-sm text-rose-600 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage="No campus-branch links found."
        />
      )}

      {/* Creation/Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Link" : "Link Branch to Campus"}
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
                Select Campus <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.campusId}
                onChange={(e) =>
                  setFormData({ ...formData, campusId: e.target.value })
                }
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm"
                disabled={isSaving}
              >
                <option value="">-- Select Campus --</option>
                {campuses.map((campus) => (
                  <option key={campus._id} value={campus._id}>
                    {campus.name} ({campus.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>
                Select Branch <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.branchId}
                onChange={(e) =>
                  setFormData({ ...formData, branchId: e.target.value })
                }
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm"
                disabled={isSaving || !formData.campusId}
              >
                <option value="">-- Select Branch --</option>
                {branches
                  .filter((branch) => {
                    if (!formData.campusId) return true;
                    const campus = campuses.find(
                      (c) => c._id === formData.campusId,
                    );
                    if (campus?.code === "KIET-W") {
                      return ["CSM", "CAI", "AIDS"].includes(branch.code);
                    }
                    return true;
                  })
                  .map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
              </select>
            </div>

            {editId && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isAvailable: Boolean(checked),
                    })
                  }
                />
                <Label htmlFor="isAvailable" className="cursor-pointer">
                  Is Available?
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
                    ? "Update Link"
                    : "Save Link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
