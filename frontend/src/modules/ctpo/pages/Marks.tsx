import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState } from '@/components/common';
import { studentService, type Student } from '@/services/studentService';
import { subjectService, type Subject } from '@/services/subjectService';
import { examinationService, type Examination, type Mark } from '@/services/examinationService';
import { useAuth } from '@/providers/AuthProvider';

interface StudentMarkRow {
  student: Student;
  markRecord?: Mark;
  editedMark: string;
}

export const Marks = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [allMarks, setAllMarks] = useState<Mark[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const [rows, setRows] = useState<StudentMarkRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const scopeFilter = { sectionId: user?.scope?.sectionId };
      const [studentsData, subjectsData, examsData, marksData] = await Promise.all([
        studentService.getAllStudents(scopeFilter),
        subjectService.getAllSubjects(),
        examinationService.getAllExaminations(),
        examinationService.getAllMarks()
      ]);
      setStudents(studentsData);
      setSubjects(subjectsData);
      setExaminations(examsData);
      setAllMarks(marksData);
      
      if (examsData.length > 0) setSelectedExam(examsData[0]._id);
      if (subjectsData.length > 0) setSelectedSubject(subjectsData[0]._id);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update rows when selection changes
  useEffect(() => {
    if (!selectedExam || !selectedSubject || students.length === 0) {
      setRows([]);
      return;
    }
    
    const newRows = students.map(student => {
      const markRecord = allMarks.find(m => 
        m.studentId === student._id && 
        (typeof m.subjectId === 'string' ? m.subjectId : m.subjectId._id) === selectedSubject &&
        (typeof m.examinationId === 'string' ? m.examinationId : m.examinationId._id) === selectedExam
      );
      
      return {
        student,
        markRecord,
        editedMark: markRecord ? String(markRecord.marks) : ''
      };
    });
    
    setRows(newRows);
    setSaveMessage(null);
  }, [selectedExam, selectedSubject, students, allMarks]);

  const handleMarkChange = (studentId: string, value: string) => {
    setRows(prev => prev.map(r => 
      r.student._id === studentId ? { ...r, editedMark: value } : r
    ));
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Find rows that were changed
      const changes = rows.filter(r => {
        const original = r.markRecord ? String(r.markRecord.marks) : '';
        return r.editedMark !== original && r.editedMark.trim() !== '';
      });
      
      if (changes.length === 0) {
        setSaveMessage({ type: 'success', text: 'No changes to save.' });
        setIsSaving(false);
        return;
      }
      
      const promises = changes.map(async row => {
        const numericMark = parseFloat(row.editedMark);
        if (isNaN(numericMark)) throw new Error(`Invalid mark for student ${row.student.rollNo}`);
        
        if (row.markRecord) {
          return examinationService.updateMark(row.markRecord._id, { marks: numericMark });
        } else {
          return examinationService.createMark({
            studentId: row.student._id,
            subjectId: selectedSubject,
            examinationId: selectedExam,
            marks: numericMark
          });
        }
      });
      
      await Promise.all(promises);
      
      // Refresh marks data
      const newMarks = await examinationService.getAllMarks();
      setAllMarks(newMarks);
      
      setSaveMessage({ type: 'success', text: 'Marks saved successfully!' });
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save marks.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader 
        title="Marks Entry & View" 
        description="View and enter marks for your assigned class."
      />

      {isLoading ? (
        <LoadingSkeleton type="form" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Examination</label>
              <select 
                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                value={selectedExam}
                onChange={e => setSelectedExam(e.target.value)}
              >
                {examinations.map(e => <option key={e._id} value={e._id}>{e.type} - {e.term}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Subject</label>
              <select 
                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 w-48">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                        No students found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    rows.map(row => (
                      <tr key={row.student._id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{row.student.rollNo}</td>
                        <td className="px-4 py-3">{row.student.name}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            className="w-full border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter marks"
                            value={row.editedMark}
                            onChange={e => handleMarkChange(row.student._id, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {rows.length > 0 && (
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
                <div>
                  {saveMessage && (
                    <span className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {saveMessage.text}
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
