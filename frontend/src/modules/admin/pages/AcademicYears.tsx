import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { academicConfigService, type AcademicYear } from '@/services/academicConfigService';
import { Plus, Loader2, Pencil } from 'lucide-react';
import { format } from 'date-fns';

export const AcademicYears = () => {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Track edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ academicYear: '', startDate: '', endDate: '', isActive: true });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await academicConfigService.getAllAcademicYears();
      setYears(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load academic years');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = () => {
    setEditId(null);
    setFormData({ academicYear: '', startDate: '', endDate: '', isActive: true });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (year: AcademicYear) => {
    setEditId(year._id);
    setFormData({
      academicYear: year.academicYear || '',
      startDate: year.startDate ? new Date(year.startDate).toISOString().split('T')[0] : '',
      endDate: year.endDate ? new Date(year.endDate).toISOString().split('T')[0] : '',
      isActive: year.status === 'ACTIVE'
    });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.academicYear.trim()) {
      setSaveError('Academic Year is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        academicYear: formData.academicYear.trim(),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        status: formData.isActive ? 'ACTIVE' : 'INACTIVE'
      };

      if (editId) {
        await academicConfigService.updateAcademicYear(editId, payload);
      } else {
        await academicConfigService.createAcademicYear(payload);
      }
      
      setIsDialogOpen(false);
      await loadData();
    } catch (err: any) {
      setSaveError(err.message || `Failed to ${editId ? 'update' : 'create'} academic year. Please try again.`);
    } finally {
      setIsSaving(false);
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
            { header: 'Year', cell: (row) => row.academicYear },
            { header: 'Start Date', cell: (row) => row.startDate ? format(new Date(row.startDate), 'MMM dd, yyyy') : '-' },
            { header: 'End Date', cell: (row) => row.endDate ? format(new Date(row.endDate), 'MMM dd, yyyy') : '-' },
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
          emptyMessage="No academic years found."
        />
      )}

      {/* Creation/Edit Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editId ? 'Edit Academic Year' : 'Add Academic Year'}</h2>
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
                  Academic Year <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 2026-2027"
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              {editId && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Is Active?
                  </label>
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
                  {isSaving ? 'Saving...' : (editId ? 'Update Year' : 'Save Year')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
