import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { sectionService, type Section } from '@/services/sectionService';
import { academicConfigService, type Semester } from '@/services/academicConfigService';
import { Plus, Loader2, Pencil } from 'lucide-react';

export const Sections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ sectionName: '', semesterId: '' });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sectionsData, semestersData] = await Promise.all([
        sectionService.getAllSections(),
        academicConfigService.getAllSemesters()
      ]);
      setSections(sectionsData);
      setSemesters(semestersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load sections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = () => {
    setEditId(null);
    setFormData({ sectionName: '', semesterId: '' });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (section: Section) => {
    setEditId(section._id);
    setFormData({
      sectionName: section.sectionName || '',
      semesterId: typeof section.semesterId === 'string' ? section.semesterId : section.semesterId?._id || ''
    });
    setSaveError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.semesterId) {
      setSaveError('Please select a Semester.');
      return;
    }
    if (!formData.sectionName.trim()) {
      setSaveError('Section Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        sectionName: formData.sectionName.trim(),
        semesterId: formData.semesterId
      };

      if (editId) {
        await sectionService.updateSection(editId, payload);
      } else {
        await sectionService.createSection(payload);
      }
      
      setIsDialogOpen(false);
      await loadData();
    } catch (err: any) {
      setSaveError(err.message || `Failed to ${editId ? 'update' : 'create'} section. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader 
          title="Sections" 
          description="Manage class sections across different semesters."
        />
        <button 
          onClick={handleOpenDialog}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <DataTable 
          data={sections}
          columns={[
            { header: 'Section Name', cell: (row) => row.sectionName },
            { 
              header: 'Semester', 
              cell: (row) => (row.semesterId as Semester)?.semesterCode || '-' 
            },
            { header: 'Actions', cell: (row) => (
              <button 
                onClick={() => handleEdit(row)}
                className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            ) },
          ]}
          emptyMessage="No sections found."
        />
      )}

      {/* Creation/Edit Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editId ? 'Edit Section' : 'Add New Section'}</h2>
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
                  Select Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.semesterId}
                  onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  disabled={isSaving}
                >
                  <option value="">-- Select Semester --</option>
                  {semesters.map(semester => (
                    <option key={semester._id} value={semester._id}>{semester.semesterCode}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Section Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. A"
                  disabled={isSaving}
                />
              </div>

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
                  {isSaving ? 'Saving...' : (editId ? 'Update Section' : 'Save Section')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
