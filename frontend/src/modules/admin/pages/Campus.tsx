import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { campusService, type Campus as CampusType } from '@/services/campusService';
import { Plus, Loader2, Pencil } from 'lucide-react';

export const Campus = () => {
  const [campuses, setCampuses] = useState<CampusType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Track if we are editing an existing item
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', location: '' });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await campusService.getAllCampuses();
      setCampuses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load campuses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = () => {
    setEditId(null);
    setFormData({ name: '', code: '', location: '' });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (campus: CampusType) => {
    setEditId(campus._id);
    setFormData({
      name: campus.name || '',
      code: campus.code || '',
      location: campus.location || ''
    });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.name.trim()) {
      setSaveError('Campus Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        location: formData.location.trim(),
        status: 'ACTIVE'
      };

      if (editId) {
        await campusService.updateCampus(editId, payload);
      } else {
        await campusService.createCampus(payload);
      }
      
      setIsDialogOpen(false);
      await loadData();
    } catch (err: any) {
      setSaveError(err.message || `Failed to ${editId ? 'update' : 'create'} campus. Please try again.`);
    } finally {
      setIsSaving(false);
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
            { header: 'Campus Name', cell: (row) => row.name },
            { header: 'Code', cell: (row) => row.code },
            { header: 'Location', cell: (row) => row.location || '-' },
            { header: 'Status', cell: (row) => (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                {row.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </span>
            ) },
            { header: 'Actions', cell: (row) => (
              <button 
                onClick={() => handleEdit(row)}
                className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            ) },
          ]}
          emptyMessage="No campuses found."
        />
      )}

      {/* Campus Creation/Edit Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editId ? 'Edit Campus' : 'Add New Campus'}</h2>
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
                <label className="text-sm font-medium text-slate-700">
                  Campus Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Main Campus"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. MC"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. New York, NY"
                  disabled={isSaving}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
                  {isSaving ? 'Saving...' : (editId ? 'Update Campus' : 'Save Campus')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
