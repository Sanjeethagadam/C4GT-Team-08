import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable, ConfirmDialog } from '@/components/common';
import { remedialService, type RemedialClass } from '@/services/remedialService';
import { Plus, CheckSquare, CheckCircle, Trash2, X, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '@/services/apiClient';
import { AttendanceModal } from '../components/AttendanceModal';

export const RemedialClasses = () => {
  const [classes, setClasses] = useState<RemedialClass[]>([]);
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
    subjectId: '',
    customSubjectName: '',
    topic: '',
    facultyName: '',
    targetYear: '',
    targetSemester: '',
    targetSection: ''
  });

  const [subjects, setSubjects] = useState<any[]>([]);
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [loadingEligible, setLoadingEligible] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await remedialService.getAllRemedialClasses();
      setClasses(data);
      
      const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';
      const subRes = await apiClient.get(`${getBase()}/subjects`);
      setSubjects(subRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load remedial classes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fetchEligibleStudents = async () => {
    if (!formData.subjectId) {
      setEligibleStudents([]);
      return;
    }
    setLoadingEligible(true);
    try {
      const students = await remedialService.getEligibleStudents({
        subjectId: formData.subjectId,
        targetYear: formData.targetYear ? Number(formData.targetYear) : undefined,
        targetSection: formData.targetSection || undefined
      });
      setEligibleStudents(students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEligible(false);
    }
  };

  useEffect(() => {
    fetchEligibleStudents();
  }, [formData.subjectId, formData.targetYear, formData.targetSection]);

  const StatusBadge = ({ status }: { status: string }) => {
    let color = 'bg-slate-100 text-slate-800';
    if (status === 'COMPLETED') color = 'bg-emerald-100 text-emerald-800';
    if (status === 'PENDING' || status === 'SCHEDULED') color = 'bg-amber-100 text-amber-800';
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
      subjectId: '',
      customSubjectName: '',
      topic: '',
      facultyName: '',
      targetYear: '',
      targetSemester: '',
      targetSection: ''
    });
    setEditingId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.startTime >= formData.endTime) {
      alert("End time must be later than start time.");
      return;
    }

    if (eligibleStudents.length === 0) {
      alert("No eligible backlog students found. Cannot schedule empty session.");
      return;
    }

    try {
      const payload = {
          ...formData,
          subjectId: formData.subjectId || undefined,
          customSubjectName: formData.customSubjectName || undefined,
          targetYear: formData.targetYear ? Number(formData.targetYear) : undefined,
          targetSemester: formData.targetSemester ? Number(formData.targetSemester) : undefined,
          targetSection: formData.targetSection ? formData.targetSection : undefined
          // eligibleStudentIds are calculated on the backend
      };
      
      if (editingId) {
        await remedialService.updateRemedialClass(editingId, payload);
      } else {
        await remedialService.createRemedialClass(payload);
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to ${editingId ? 'update' : 'schedule'} session`);
    }
  };

  const handleComplete = async (row: RemedialClass) => {
    if (!window.confirm(`Mark session "${row.topic}" as completed?`)) return;
    try {
      const payload = {
        date: row.date,
        startTime: row.startTime,
        endTime: row.endTime,
        venue: row.venue,
        subjectId: row.subjectId?._id || row.subjectId,
        customSubjectName: row.customSubjectName,
        topic: row.topic,
        facultyName: row.facultyName,
        targetYear: row.targetYear,
        targetSemester: row.targetSemester,
        targetSection: row.targetSection?._id || row.targetSection,
        status: 'COMPLETED'
      };
      await remedialService.updateRemedialClass(row._id, payload as any);
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to mark session as completed');
    }
  };

  const handleEdit = (row: RemedialClass) => {
    setFormData({
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
      startTime: row.startTime || '',
      endTime: row.endTime || '',
      venue: row.venue || '',
      subjectId: row.subjectId?._id || row.subjectId || '',
      customSubjectName: row.customSubjectName || '',
      topic: row.topic || '',
      facultyName: row.facultyName || '',
      targetYear: row.targetYear?.toString() || '',
      targetSemester: row.targetSemester?.toString() || '',
      targetSection: row.targetSection?.toString() || ''
    });
    setEditingId(row._id);
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
          title="Remedial Classes" 
          description="Manage subject-specific academic support sessions for ACTIVE backlog students."
        />
        <button 
          onClick={() => { resetForm(); setIsDialogOpen(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <DataTable 
          data={classes}
          columns={[
            { header: 'Subject', cell: (row) => <span className="font-semibold text-slate-800">{row.subjectId?.subjectName || row.customSubjectName || 'Unknown'}</span> },
            { header: 'Faculty', cell: (row) => row.facultyName },
            { header: 'Topic', cell: (row) => row.topic || 'No topic' },
            { header: 'Date', cell: (row) => row.date ? format(new Date(row.date), 'MMM dd, yyyy') : '-' },
            { header: 'Time', cell: (row) => row.startTime ? `${formatTime(row.startTime)} - ${formatTime(row.endTime)}` : '-' },
            { header: 'Eligible', cell: (row) => <span className="font-medium">{row.eligibleStudentIds?.length || 0}</span> },
            { header: 'Status', cell: (row) => <StatusBadge status={row.status || 'SCHEDULED'} /> },
            { 
              header: 'Actions', 
              cell: (row) => (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setAttendanceSessionId({ id: row._id, type: 'RemedialClass', title: `Attendance: ${row.subjectId?.subjectName || row.customSubjectName}` })}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Mark Attendance"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                  {row.status !== 'COMPLETED' && (
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
                    title="Edit Class"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteTarget(row._id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) 
            },
          ]}
          emptyMessage="No remedial classes found."
        />
      )}
      
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Cancel Remedial Class"
        description="Are you sure you want to cancel and delete this remedial session? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isConfirming={isDeleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          try {
            await remedialService.deleteRemedialClass(deleteTarget);
            await loadData();
            setDeleteTarget(null);
          } catch (err: any) {
            alert(err.message || 'Failed to delete remedial class');
          } finally {
            setIsDeleting(false);
          }
        }}
      />
      
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
             <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
                <h2 className="text-xl font-bold">Schedule Remedial Session</h2>
                <button onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <form onSubmit={handleCreate} className="space-y-4 flex flex-col h-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Subject</label>
                      <select 
                        className="w-full p-2 border rounded" 
                        value={formData.subjectId} 
                        onChange={e => setFormData({...formData, subjectId: e.target.value})}
                      >
                          <option value="">-- Select Subject (Triggers Backlog Search) --</option>
                          {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>)}
                      </select>
                      <p className="text-xs text-slate-500 mt-1">Select a subject to automatically find ACTIVE backlog students.</p>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Topic</label>
                      <input type="text" required className="w-full p-2 border rounded" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input type="date" required className="w-full p-2 border rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
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

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Faculty Name</label>
                      <input type="text" required className="w-full p-2 border rounded" value={formData.facultyName} onChange={e => setFormData({...formData, facultyName: e.target.value})} />
                    </div>

                    <div className="col-span-2 pt-2 pb-1 border-b">
                      <h3 className="font-semibold text-sm">Narrow Target Population (Optional)</h3>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Narrow by Year</label>
                      <select className="w-full p-2 border rounded" value={formData.targetYear} onChange={e => setFormData({...formData, targetYear: e.target.value})}>
                          <option value="">All Years</option>
                          <option value="1">Year 1</option>
                          <option value="2">Year 2</option>
                          <option value="3">Year 3</option>
                          <option value="4">Year 4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Narrow by Section ID</label>
                      <input type="text" className="w-full p-2 border rounded" value={formData.targetSection} onChange={e => setFormData({...formData, targetSection: e.target.value})} placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Semester (Metadata)</label>
                      <input type="number" min="1" max="2" className="w-full p-2 border rounded" value={formData.targetSemester} onChange={e => setFormData({...formData, targetSemester: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t mt-6">
                    <button type="submit" className="w-full px-4 py-2 bg-primary text-white rounded-md text-sm font-medium">Schedule Session</button>
                  </div>
                </form>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col h-full max-h-[600px]">
                  <h3 className="font-semibold text-slate-800 mb-2">Eligible Roster Preview</h3>
                  <div className="text-sm text-slate-600 mb-4 pb-4 border-b">
                    Automatically matches students with an ACTIVE backlog in the selected subject.
                  </div>
                  
                  {loadingEligible ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-slate-500">Loading roster...</div>
                  ) : !formData.subjectId ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-slate-500">Select a subject to view eligible students.</div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">Target Count: <span className="text-primary">{finalEligibleList.length}</span></span>
                      </div>
                      <div className="flex-1 overflow-auto border rounded bg-white">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-100 sticky top-0">
                            <tr>
                              <th className="p-2 font-medium">HTNO / Name</th>
                              <th className="p-2 font-medium">Branch</th>
                              <th className="p-2 font-medium">Year</th>
                              <th className="p-2 font-medium text-center">Backlog Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {finalEligibleList.map(s => (
                              <tr key={s._id} className="border-b last:border-0 hover:bg-slate-50">
                                <td className="p-2">
                                  <div className="font-medium">{s.rollNo}</div>
                                  <div className="text-xs text-slate-500">{s.name}</div>
                                </td>
                                <td className="p-2">{s.branchId?.code}</td>
                                <td className="p-2">Y{s.year}</td>
                                <td className="p-2 text-center font-medium text-rose-600 bg-rose-50/50">
                                  {s.activeBacklogCount || 1}
                                </td>
                              </tr>
                            ))}
                            {finalEligibleList.length === 0 && (
                              <tr>
                                <td colSpan={4} className="p-4 text-center text-slate-500 italic">No eligible active backlog students found.</td>
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
