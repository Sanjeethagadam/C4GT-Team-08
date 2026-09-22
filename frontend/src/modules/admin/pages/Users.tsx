import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { userService, type User } from '@/services/userService';
import { studentService, type Student } from '@/services/studentService';
import { Plus, Loader2, Pencil, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolePermissions } from './RolePermissions';

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'STUDENT',
    studentId: '',
    status: 'ACTIVE'
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, studentsData] = await Promise.all([
        userService.getAllUsers(),
        studentService.getAllStudents()
      ]);
      setUsers(usersData);
      setStudents(studentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
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
      username: '',
      password: '',
      role: 'STUDENT',
      studentId: '',
      status: 'ACTIVE'
    });
    setSaveError(null);
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditId(user._id);
    setFormData({
      username: user.username || '',
      password: '', // Leave blank when editing
      role: user.role || 'STUDENT',
      studentId: typeof user.studentId === 'string' ? user.studentId : user.studentId?._id || '',
      status: user.status || 'ACTIVE'
    });
    setSaveError(null);
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.username.trim()) {
      setSaveError('Username / Email is required.');
      return;
    }
    if (!editId && formData.password.length < 6) {
      setSaveError('Password must be at least 6 characters long.');
      return;
    }
    if (editId && formData.password && formData.password.length < 6) {
      setSaveError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.role === 'STUDENT' && !formData.studentId) {
      setSaveError('You must link a Student record when creating a STUDENT role.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        username: formData.username.trim(),
        role: formData.role,
        studentId: formData.role === 'STUDENT' ? formData.studentId : undefined,
        status: formData.status
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
    } catch (err: any) {
      setSaveError(err.message || `Failed to ${editId ? 'update' : 'create'} user. Ensure username is unique.`);
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
              { header: 'Username / Email', cell: (row) => row.username || '-' },
              { header: 'Role', cell: (row) => (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                  {row.role}
                </span>
              ) },
              { header: 'Status', cell: (row) => (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {row.status === 'ACTIVE' ? 'Active' : 'Disabled'}
                </span>
              ) },
              { header: 'Actions', cell: (row) => (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleEdit(row)}
                    className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete user ${row.username}? This action is irreversible.`)) {
                         try {
                           await userService.deleteUser(row._id);
                           await loadData();
                         } catch (e: any) {
                           alert(e.message || 'Failed to delete user.');
                         }
                      }
                    }}
                    className="flex items-center gap-1 text-sm text-rose-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </div>
              ) },
            ]}
            emptyMessage="No users found."
          />
        )}
      </TabsContent>

      <TabsContent value="roles">
        <RolePermissions />
      </TabsContent>

      {/* User Creation/Edit Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editId ? 'Edit User' : 'Create New User'}</h2>
              <button 
                onClick={() => !isSaving && setIsDialogOpen(false)} 
                disabled={isSaving}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {saveError && (
                <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-md border border-rose-100">
                  {saveError}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role <span className="text-rose-500">*</span></label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, studentId: '' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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

              {formData.role === 'STUDENT' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Link Student Record <span className="text-rose-500">*</span></label>
                  <input
                    list="student-list"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    placeholder="Search by Roll No or Name..."
                    disabled={isSaving}
                  />
                  <datalist id="student-list">
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.rollNo})</option>
                    ))}
                  </datalist>
                  <p className="text-xs text-slate-500 mt-1">Select the exact Object ID from the dropdown list to link the account properly.</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Username / Email <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. john@student.kiet.edu"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Password {editId ? '' : <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                    placeholder={editId ? "Leave blank to keep unchanged" : "Minimum 6 characters"}
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {editId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status <span className="text-rose-500">*</span></label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    disabled={isSaving}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)} 
                  disabled={isSaving}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving...' : (editId ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Tabs>
  );
};
