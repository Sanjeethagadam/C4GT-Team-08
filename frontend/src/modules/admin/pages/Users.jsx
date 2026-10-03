import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
} from "@/components/common";
import { userService } from "@/services/userService";
import { studentService } from "@/services/studentService";
import { Plus, Loader2, Pencil, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RolePermissions } from "./RolePermissions";

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "STUDENT",
    studentId: "",
    status: "ACTIVE",
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, studentsData] = await Promise.all([
        userService.getAllUsers(),
        studentService.getAllStudents(),
      ]);
      setUsers(usersData);
      setStudents(studentsData);
    } catch (err) {
      setError(err.message || "Failed to load users");
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
      username: "",
      password: "",
      role: "STUDENT",
      studentId: "",
      status: "ACTIVE",
    });
    setSaveError(null);
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setFormData({
      username: user.username || "",
      password: "", // Leave blank when editing
      role: user.role || "STUDENT",
      studentId:
        typeof user.studentId === "string"
          ? user.studentId
          : user.studentId?._id || "",
      status: user.status || "ACTIVE",
    });
    setSaveError(null);
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.username.trim()) {
      setSaveError("Username / Email is required.");
      return;
    }
    if (!editId && formData.password.length < 6) {
      setSaveError("Password must be at least 6 characters long.");
      return;
    }
    if (editId && formData.password && formData.password.length < 6) {
      setSaveError("Password must be at least 6 characters long.");
      return;
    }
    if (formData.role === "STUDENT" && !formData.studentId) {
      setSaveError(
        "You must link a Student record when creating a STUDENT role.",
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        username: formData.username.trim(),
        role: formData.role,
        studentId: formData.role === "STUDENT" ? formData.studentId : undefined,
        status: formData.status,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editId) {
        await userService.updateUser(editId, payload);
      } else {
        await userService.createUser(payload);
      }
      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      setSaveError(
        err.message ||
          `Failed to ${editId ? "update" : "create"} user. Ensure username is unique.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Tabs defaultValue="users" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <PageHeader
          title="Users & Access"
          description="Manage system users, role-based access, and account linking."
        />

        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Role Permissions</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="users" className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={handleOpenDialog}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Create User
          </button>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="table" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadData()} />
        ) : (
          <DataTable
            data={users}
            columns={[
              {
                header: "Username / Email",
                cell: (row) => row.username || "-",
              },
              {
                header: "Role",
                cell: (row) => (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                    {row.role}
                  </span>
                ),
              },
              {
                header: "Status",
                cell: (row) => (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
                  >
                    {row.status === "ACTIVE" ? "Active" : "Disabled"}
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
                      onClick={async () => {
                        if (
                          confirm(
                            `Are you sure you want to delete user ${row.username}? This action is irreversible.`,
                          )
                        ) {
                          try {
                            await userService.deleteUser(row._id);
                            await loadData();
                          } catch (e) {
                            alert(e.message || "Failed to delete user.");
                          }
                        }
                      }}
                      className="flex items-center gap-1 text-sm text-rose-600 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            emptyMessage="No users found."
          />
        )}
      </TabsContent>

      <TabsContent value="roles">
        <RolePermissions />
      </TabsContent>

      {/* User Creation/Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit User" : "Create New User"}
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
                Role <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                    studentId: "",
                  })
                }
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm"
                disabled={isSaving}
              >
                <option value="STUDENT">Student</option>
                <option value="CTPO">CTPO</option>
                <option value="HOD">HOD</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="COORDINATOR">Coordinator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {formData.role === "STUDENT" && (
              <div className="space-y-2">
                <Label>
                  Link Student Record <span className="text-rose-500">*</span>
                </Label>
                <Input
                  list="student-list"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  placeholder="Search by Roll No or Name..."
                  disabled={isSaving}
                />

                <datalist id="student-list">
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.rollNo})
                    </option>
                  ))}
                </datalist>
                <p className="text-xs text-muted-foreground mt-1">
                  Select the exact Object ID from the dropdown list to link
                  the account properly.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                Username / Email <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="e.g. john@student.kiet.edu"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Password{" "}
                {editId ? "" : <span className="text-rose-500">*</span>}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pr-10"
                  placeholder={
                    editId
                      ? "Leave blank to keep unchanged"
                      : "Minimum 6 characters"
                  }
                  disabled={isSaving}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {editId && (
              <div className="space-y-2">
                <Label>
                  Status <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm"
                  disabled={isSaving}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
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
                    ? "Update User"
                    : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};
