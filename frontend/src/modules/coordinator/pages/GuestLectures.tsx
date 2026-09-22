import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable, ConfirmDialog } from '@/components/common';
import { guestLectureService, type GuestLecture } from '@/services/guestLectureService';
import { Plus, CheckSquare, Trash2, X, Users, Edit, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '@/services/apiClient';
import { AttendanceModal } from '../components/AttendanceModal';

export const GuestLectures = () => {
  const [lectures, setLectures] = useState<GuestLecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [attendanceSessionId, setAttendanceSessionId] = useState<{ id: string, type: 'RemedialClass' | 'GuestLecture', title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    topic: '',
    speakerName: '',
    organization: '',
    designation: '',
    targetBranches: [] as string[],
    targetYear: [] as string[],
    targetSemester: '',
    targetSection: '',
    subjectId: '',
    customSubjectName: ''
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectMappings, setSubjectMappings] = useState<any[]>([]);
  const [useCustomSubject, setUseCustomSubject] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [loadingEligible, setLoadingEligible] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await guestLectureService.getAllGuestLectures();
      setLectures(data);
      const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';
      const branchRes = await apiClient.get(`${getBase()}/branches`);
      setBranches(branchRes.data || []);
      const mapRes = await apiClient.get(`${getBase()}/subject-branch-mappings`);
      setSubjectMappings(mapRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load guest lectures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter subjects based on targetBranches, targetYear, targetSemester
    if (subjectMappings.length > 0) {
      const filtered = subjectMappings.filter(m => {
        if (!m.subjectId || !m.branchId || !m.semesterId) return false;
        
        const branchMatch = formData.targetBranches.length === 0 || formData.targetBranches.includes(m.branchId._id);
        const yearMatch = formData.targetYear.length === 0 || formData.targetYear.includes(m.semesterId?.year?.toString());
        const semMatch = !formData.targetSemester || m.semesterId?.semesterCode?.endsWith(`-${formData.targetSemester}`);

        return branchMatch && yearMatch && semMatch;
      });
      
      // Extract unique subjects
      const uniqueSubjects = new Map();
      filtered.forEach(m => uniqueSubjects.set(m.subjectId._id, m.subjectId));
      setSubjects(Array.from(uniqueSubjects.values()));
    }
  }, [formData.targetBranches, formData.targetYear, formData.targetSemester, subjectMappings]);

  const fetchEligibleStudents = async () => {
    setLoadingEligible(true);
    try {
      const students = await guestLectureService.getTargetStudents({
        targetBranches: formData.targetBranches.join(','),
        targetYear: formData.targetYear.join(','),
        targetSemester: formData.targetSemester ? Number(formData.targetSemester) : undefined,
        targetSection: formData.targetSection || undefined,
        subjectId: formData.subjectId || undefined
      } as any);
      setEligibleStudents(students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEligible(false);
    }
  };

  useEffect(() => {
    // Re-fetch when targeting criteria change
    const timeoutId = setTimeout(() => {
      fetchEligibleStudents();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.targetBranches, formData.targetYear, formData.targetSemester, formData.targetSection]);

  const StatusBadge = ({ status }: { status: string }) => {
    let color = 'bg-slate-100 text-slate-800';
    if (status === 'COMPLETED') color = 'bg-emerald-100 text-emerald-800';
    if (status === 'SCHEDULED') color = 'bg-amber-100 text-amber-800';
    if (status === 'CANCELLED') color = 'bg-rose-100 text-rose-800';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {status || 'SCHEDULED'}
      </span>
    );
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      date: '',
      startTime: '',
      endTime: '',
      venue: '',
      topic: '',
      speakerName: '',
      organization: '',
      designation: '',
      targetBranches: [] as string[],
      targetYear: [] as string[],
      targetSemester: '',
      targetSection: '',
      subjectId: '',
      customSubjectName: ''
    });
    setEditingId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.startTime >= formData.endTime) {
      alert("End time must be later than start time.");
      return;
    }

    try {
      const payload = {
          ...formData,
          targetYear: formData.targetYear.map(Number),
          targetSemester: formData.targetSemester ? Number(formData.targetSemester) : undefined,
          targetSection: formData.targetSection ? formData.targetSection : undefined
          // eligibleStudentIds is handled on the backend
      };
      
      if (editingId) {
        await guestLectureService.updateGuestLecture(editingId, payload as any);
      } else {
        await guestLectureService.createGuestLecture(payload as any);
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.errors 
        ? err.response.data.errors.map((e: any) => e.msg).join(', ') 
        : (err.response?.data?.message || `Failed to ${editingId ? 'update' : 'schedule'} guest lecture`);
      alert(`Failed to ${editingId ? 'update' : 'schedule'} guest lecture: ${errorMsg}`);
    }
  };

  const handleComplete = async (row: GuestLecture) => {
    if (!window.confirm(`Mark guest lecture "${row.topic}" as completed?`)) return;
    try {
      const payload = {
        date: row.date,
        startTime: row.startTime,
        endTime: row.endTime,
        venue: row.venue,
        topic: row.topic,
        speakerName: row.speakerName,
        organization: row.organization,
        designation: row.designation,
        targetBranches: Array.isArray(row.targetBranches) ? row.targetBranches.map(b => (b as any)._id || b) : [],
        targetYear: Array.isArray(row.targetYear) ? row.targetYear.map(String) : (row.targetYear ? [String(row.targetYear)] : []),
        targetSemester: row.targetSemester,
        targetSection: typeof row.targetSection === 'object' ? (row.targetSection as any)._id : row.targetSection,
        subjectId: row.subjectId ? (row.subjectId as any)._id || row.subjectId : undefined,
        customSubjectName: row.customSubjectName,
        status: 'COMPLETED'
      };
      await guestLectureService.updateGuestLecture(row._id, payload as any);
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to mark lecture as completed');
    }
  };

  const handleEdit = (row: GuestLecture) => {
    setFormData({
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
      startTime: row.startTime || '',
      endTime: row.endTime || '',
      venue: row.venue || '',
      topic: row.topic || '',
      speakerName: row.speakerName || '',
      organization: row.organization || '',
      designation: row.designation || '',
      targetBranches: Array.isArray(row.targetBranches) ? row.targetBranches.map(b => (b as any)._id || b) : [],
      targetYear: Array.isArray(row.targetYear) ? row.targetYear.map(String) : (row.targetYear ? [String(row.targetYear)] : []),
      targetSemester: row.targetSemester?.toString() || '',
      targetSection: typeof row.targetSection === 'object' ? (row.targetSection as any)._id : (row.targetSection || ''),
      subjectId: row.subjectId ? (row.subjectId as any)._id || row.subjectId : '',
      customSubjectName: row.customSubjectName || ''
    });
    setEditingId(row._id);
    setUseCustomSubject(!!row.customSubjectName);
    setIsDialogOpen(true);
  };

  const finalEligibleList = eligibleStudents;

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader 
          title="Guest Lectures" 
          description="Organize external talks and expert sessions for general student populations."
        />
        <button 
          onClick={() => { resetForm(); setIsDialogOpen(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Schedule Lecture
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <DataTable 
          data={lectures}
          columns={[
            { header: 'Subject', cell: (row) => row.subjectId?.subjectName || row.customSubjectName || '-' },
            { header: 'Topic', cell: (row) => row.topic || 'No Topic' },
            { header: 'Speaker', cell: (row) => row.speakerName || 'Unknown' },
            { header: 'Date', cell: (row) => row.date ? format(new Date(row.date), 'MMM dd, yyyy') : '-' },
            { header: 'Time', cell: (row) => row.startTime ? `${formatTime(row.startTime)} - ${formatTime(row.endTime)}` : '-' },
            { header: 'Eligible', cell: (row) => <span className="font-medium">{row.eligibleStudentIds?.length || 0}</span> },
            { header: 'Status', cell: (row) => <StatusBadge status={row.status || 'SCHEDULED'} /> },
            { 
              header: 'Actions', 
              cell: (row) => (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setAttendanceSessionId({ id: row._id, type: 'GuestLecture', title: `Attendance: ${row.topic}` })}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Mark Attendance"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                  {row.status !== 'COMPLETED' && row.status !== 'CANCELLED' && (
                    <button 
                      onClick={() => handleComplete(row)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Mark as Completed"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleEdit(row)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                    title="Edit Lecture"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteTarget(row._id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    title="Delete Lecture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) 
            },
          ]}
          emptyMessage="No guest lectures found."
        />
      )}
      
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Cancel Guest Lecture"
        description="Are you sure you want to cancel and delete this guest lecture? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isConfirming={isDeleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          try {
            await guestLectureService.deleteGuestLecture(deleteTarget);
            await loadData();
            setDeleteTarget(null);
          } catch (err: any) {
            alert(err.message || 'Failed to delete guest lecture');
          } finally {
            setIsDeleting(false);
          }
        }}
      />
      
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
             <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
                <h2 className="text-xl font-bold">Schedule Guest Lecture</h2>
                <button onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <form onSubmit={handleCreate} className="space-y-4 flex flex-col h-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Topic</label>
                      <input type="text" required className="w-full p-2 border rounded" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Speaker Name</label>
                      <input type="text" required className="w-full p-2 border rounded" value={formData.speakerName} onChange={e => setFormData({...formData, speakerName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Organization</label>
                      <input type="text" className="w-full p-2 border rounded" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Designation</label>
                      <input type="text" className="w-full p-2 border rounded" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input type="date" required className="w-full p-2 border rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 flex justify-between">
                        Subject
                        <label className="flex items-center space-x-1 text-xs font-normal">
                          <input type="checkbox" checked={useCustomSubject} onChange={e => setUseCustomSubject(e.target.checked)} />
                          <span>Enter manually</span>
                        </label>
                      </label>
                      {useCustomSubject ? (
                        <input type="text" className="w-full p-2 border rounded" placeholder="Custom subject name" value={formData.customSubjectName} onChange={e => setFormData({...formData, customSubjectName: e.target.value})} />
                      ) : (
                        <select className="w-full p-2 border rounded" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
                          <option value="">Select a Subject (Optional)</option>
                          {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Venue</label>
                      <input type="text" required className="w-full p-2 border rounded" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Time</label>
                      <input type="time" required className="w-full p-2 border rounded" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Time</label>
                      <input type="time" required className="w-full p-2 border rounded" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                    </div>

                    <div className="col-span-2 pt-2 pb-1 border-b">
                      <h3 className="font-semibold text-sm">Target Audience</h3>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Branch</label>
                      
                      <div className="space-y-2">
                        {branches.map(b => (
                          <label key={b._id} className="flex items-center space-x-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={formData.targetBranches.includes(b._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, targetBranches: [...formData.targetBranches, b._id] });
                                } else {
                                  setFormData({ ...formData, targetBranches: formData.targetBranches.filter(id => id !== b._id) });
                                }
                              }}
                            />
                            <span>{b.code} - {b.name}</span>
                          </label>
                        ))}
                      </div>

                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Year(s)</label>
                      <div className="space-y-2">
                        {['1', '2', '3', '4'].map(y => (
                          <label key={y} className="flex items-center space-x-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={formData.targetYear.includes(y)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, targetYear: [...formData.targetYear, y] });
                                } else {
                                  setFormData({ ...formData, targetYear: formData.targetYear.filter(yr => yr !== y) });
                                }
                              }}
                            />
                            <span>Year {y}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Semester</label>
                      <select className="w-full p-2 border rounded" value={formData.targetSemester} onChange={e => setFormData({...formData, targetSemester: e.target.value})}>
                        <option value="">Select Semester</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Section ID</label>
                      <input type="text" className="w-full p-2 border rounded" value={formData.targetSection} onChange={e => setFormData({...formData, targetSection: e.target.value})} placeholder="Optional" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t mt-6">
                    <button type="submit" className="w-full px-4 py-2 bg-primary text-white rounded-md text-sm font-medium">Schedule Lecture</button>
                  </div>
                </form>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col h-full max-h-[600px]">
                  <h3 className="font-semibold text-slate-800 mb-2">Target Population Preview</h3>
                  <div className="text-sm text-slate-600 mb-4 pb-4 border-b">
                    Matches students based on Branch, Year, Semester, and Section.
                  </div>
                  
                  {loadingEligible ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-slate-500">Loading roster...</div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          Target Count: <span className="text-primary">{finalEligibleList.length}</span>
                        </span>
                      </div>
                      <div className="flex-1 overflow-auto border rounded bg-white">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-100 sticky top-0">
                            <tr>
                              <th className="p-2 font-medium">HTNO / Name</th>
                              <th className="p-2 font-medium">Branch</th>
                            </tr>
                          </thead>
                          <tbody>
                            {finalEligibleList.slice(0, 100).map(s => (
                              <tr key={s._id} className="border-b last:border-0 hover:bg-slate-50">
                                <td className="p-2">
                                  <div className="font-medium text-slate-800">{s.rollNo}</div>
                                  <div className="text-xs text-slate-500">{s.name}</div>
                                </td>
                                <td className="p-2">{s.branchId?.code} - Y{s.year}</td>
                              </tr>
                            ))}
                            {finalEligibleList.length > 100 && (
                              <tr>
                                <td colSpan={2} className="p-3 text-center text-xs text-slate-500 bg-slate-50 italic">
                                  Showing 100 of {finalEligibleList.length} students...
                                </td>
                              </tr>
                            )}
                            {finalEligibleList.length === 0 && (
                              <tr>
                                <td colSpan={2} className="p-4 text-center text-slate-500 italic">No students match targeting criteria.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
             </div>
             </div>
          </div>
        </div>
      )}

      {attendanceSessionId && (
        <AttendanceModal 
          isOpen={true} 
          onClose={() => setAttendanceSessionId(null)}
          referenceId={attendanceSessionId.id}
          referenceType={attendanceSessionId.type}
          title={attendanceSessionId.title}
        />
      )}
    </>
  );
};
