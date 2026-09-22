import { useEffect, useState } from 'react';
import { X, Save, FileDown } from 'lucide-react';
import { attendanceService, type AttendanceRecord } from '@/services/attendanceService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string;
  referenceType: 'RemedialClass' | 'GuestLecture';
  title: string;
}

export const AttendanceModal = ({ isOpen, onClose, referenceId, referenceType, title }: AttendanceModalProps) => {
  const [session, setSession] = useState<any>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAttendance();
    }
  }, [isOpen, referenceId]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAttendance(referenceId);
      setSession(data.session);
      setRecords(data.records);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to load attendance: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (studentId: string, value: boolean) => {
    setRecords(records.map(r => r.studentId._id === studentId ? { ...r, present: value } : r));
  };

  const markAll = (value: boolean) => {
    setRecords(records.map(r => ({ ...r, present: value })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = records.map(r => ({ studentId: r.studentId._id || r.studentId as unknown as string, present: r.present }));
      await attendanceService.submitAttendance(referenceId, referenceType, payload);
      alert('Attendance saved successfully');
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save attendance: ${err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const formatTimeAMPM = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const downloadPdf = () => {
    if (!session) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Attendance Report`, 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Session Title: ${title}`, 14, 32);
    doc.text(`Type: ${session.referenceType}`, 14, 38);
    doc.text(`Subject: ${session.subjectName || '-'}`, 14, 44);
    doc.text(`Topic: ${session.topic || '-'}`, 14, 50);
    doc.text(`Faculty/Speaker: ${session.facultyName || '-'}`, 14, 56);
    if (session.referenceType === 'GuestLecture') {
      doc.text(`Organization: ${session.organization || '-'}`, 14, 62);
      doc.text(`Designation: ${session.designation || '-'}`, 14, 68);
    }
    
    const rightColX = 120;
    doc.text(`Date: ${new Date(session.date).toLocaleDateString()}`, rightColX, 32);
    doc.text(`Time: ${formatTimeAMPM(session.startTime)} - ${formatTimeAMPM(session.endTime)}`, rightColX, 38);
    doc.text(`Venue: ${session.venue || '-'}`, rightColX, 44);
    
    const presentCount = records.filter(r => r.present).length;
    const totalCount = records.length;
    const absentCount = totalCount - presentCount;
    const pct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
    
    doc.text(`Target Audience: ${totalCount} students`, rightColX, 56);
    doc.text(`Present: ${presentCount}`, rightColX, 62);
    doc.text(`Absent: ${absentCount}`, rightColX, 68);
    doc.text(`Attendance: ${pct}%`, rightColX, 74);

    const tableData = records.map((r, i) => [
      i + 1,
      (r.studentId as any).rollNo || (r.studentId as any).rollNumber || '-',
      (r.studentId as any).name || (r.studentId as any).firstName + ' ' + (r.studentId as any).lastName || '-',
      (r.studentId as any).branchId?.code || (r.studentId as any).branchId?.branchCode || '-',
      r.present ? 'Present' : 'Absent'
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['S.No', 'Roll Number', 'Name', 'Branch', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`Attendance_${title.replace(/\s+/g, '_')}.pdf`);
  };

  if (!isOpen) return null;

  const presentCount = records.filter(r => r.present).length;
  const totalCount = records.length;
  const absentCount = totalCount - presentCount;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-slate-500">Record attendance for scheduled students</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={downloadPdf}
              disabled={loading || !session}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" /> Export PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-3 bg-white border-b flex justify-between items-center shrink-0">
          <div className="flex gap-4 text-sm">
            <div className="font-medium text-slate-700">Total: <span className="text-primary">{totalCount}</span></div>
            <div className="font-medium text-slate-700">Present: <span className="text-emerald-600">{presentCount}</span></div>
            <div className="font-medium text-slate-700">Absent: <span className="text-rose-600">{absentCount}</span></div>
            <div className="font-medium text-slate-700">Attendance: <span className="text-indigo-600">{percentage}%</span></div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => markAll(true)} className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded border border-emerald-200 hover:bg-emerald-100">Mark All Present</button>
             <button onClick={() => markAll(false)} className="px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-700 rounded border border-rose-200 hover:bg-rose-100">Mark All Absent</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading ? (
            <div className="flex justify-center items-center h-48">Loading roster...</div>
          ) : records.length === 0 ? (
            <div className="flex justify-center items-center h-48 text-slate-500 bg-white border rounded">
              No students enrolled in this session.
            </div>
          ) : (
            <div className="bg-white border rounded-lg shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-3 font-semibold text-slate-700">Roll Number</th>
                    <th className="p-3 font-semibold text-slate-700">Name</th>
                    <th className="p-3 font-semibold text-slate-700">Branch</th>
                    <th className="p-3 font-semibold text-slate-700 text-center">Present?</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.studentId._id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">{(record.studentId as any).rollNo || (record.studentId as any).rollNumber || '-'}</td>
                      <td className="p-3">{(record.studentId as any).name || (record.studentId as any).firstName + ' ' + (record.studentId as any).lastName || '-'}</td>
                      <td className="p-3">{(record.studentId as any).branchId?.code || (record.studentId as any).branchId?.branchCode || '-'}</td>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox"
                          className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                          checked={record.present}
                          onChange={(e) => handleToggle(record.studentId._id, e.target.checked)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white flex justify-end items-center shrink-0">
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
