import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, ExportButton } from '@/components/common';
import { ctpoService } from '@/services/ctpoService';
import { Save, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export const MarkEntry = () => {
  const [examType, setExamType] = useState<'MID1' | 'MID2'>('MID1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [exam, setExam] = useState<any>(null);
  
  // marks: { studentId: { subjectId: { marksObtained, maxMarks, status, draft } } }
  const [marksState, setMarksState] = useState<Record<string, Record<string, any>>>({});
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success'|'error', text: string } | null>(null);

  useEffect(() => {
    loadDataset();
  }, [examType]);

  const loadDataset = async () => {
    setIsLoading(true);
    setError(null);
    setSaveMessage(null);
    try {
      const dataset = await ctpoService.getMarksDataset(examType);
      
      const loadedStudents = dataset.students || [];
      loadedStudents.sort((a: any, b: any) => (a.rollNo).localeCompare(b.rollNo));
      
      const loadedSubjects = dataset.subjects || [];
      const assignmentMarks = dataset.marks || [];
      
      setExam(dataset.exam);
      
      const newMarksState: Record<string, Record<string, any>> = {};

      loadedStudents.forEach((stu: any) => {
        if (!newMarksState[stu._id]) newMarksState[stu._id] = {};
        
        loadedSubjects.forEach((sub: any) => {
          const markRecord = assignmentMarks.find(
            (m: any) => m.studentId === stu._id && m.subjectId === sub._id
          );
          
          if (markRecord) {
            newMarksState[stu._id][sub._id] = {
              marksObtained: markRecord.marksObtained,
              maxMarks: 30, // Force 30 for MID exams
              status: markRecord.status,
              draft: markRecord.draft
            };
          } else {
            newMarksState[stu._id][sub._id] = {
              marksObtained: '',
              maxMarks: 30,
              status: 'ATTENDED',
              draft: true
            };
          }
        });
      });

      setStudents(loadedStudents);
      setSubjects(loadedSubjects);
      setMarksState(newMarksState);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, subjectId: string, field: string, value: any) => {
    setMarksState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId][subjectId],
          [field]: value
        }
      }
    }));
  };

  const saveMarks = async (isSubmit: boolean) => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const marksData: any[] = [];
      
      for (const studentId of Object.keys(marksState)) {
        for (const subjectId of Object.keys(marksState[studentId])) {
          const m = marksState[studentId][subjectId];
          if (m.marksObtained !== '') {
            marksData.push({
              studentId,
              subjectId,
              marksObtained: Number(m.marksObtained),
              maxMarks: Number(m.maxMarks),
              status: m.status
            });
          }
        }
      }

      if (marksData.length === 0) {
        setSaveMessage({ type: 'error', text: 'No marks entered to save.' });
        setIsSaving(false);
        return;
      }

      await ctpoService.saveMarks({
        examinationId: exam._id,
        marksData,
        isSubmit
      });

      setSaveMessage({ type: 'success', text: `Marks successfully ${isSubmit ? 'submitted' : 'saved as draft'}.` });
      
      // Reload dataset to reflect saved/submitted state
      await loadDataset();

    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save marks' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadDataset} />;

  const isFullySubmitted = students.length > 0 && students.every(stu => 
    subjects.every(sub => marksState[stu._id] && marksState[stu._id][sub._id] && marksState[stu._id][sub._id].draft === false)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Marks Entry" 
          description="Enter internal examination marks for your assigned class." 
        />
        <div className="flex items-center gap-4">
          <Select value={examType} onValueChange={(v: 'MID1'|'MID2') => setExamType(v)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MID1">Mid-1 Internal</SelectItem>
              <SelectItem value="MID2">Mid-2 Internal</SelectItem>
            </SelectContent>
          </Select>
          <ExportButton endpoint={`marks/${examType}`} filename={`${examType}_Marks`} title={`${examType} Internal Marks`} />
        </div>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-md flex items-center gap-2 ${saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {saveMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          {saveMessage.text}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg shadow-sm border border-slate-200 text-slate-500">
          No subjects found for your assigned branch and semester mapping.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold w-24">Roll No</th>
                  <th className="px-4 py-3 font-semibold min-w-[200px]">Student Name</th>
                  {subjects.map(sub => (
                    <th key={sub._id} className="px-4 py-3 font-semibold min-w-[150px]">
                      {sub.subjectName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map(stu => (
                  <tr key={stu._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{stu.rollNo}</td>
                    <td className="px-4 py-3">{stu.name}</td>
                    {subjects.map(sub => {
                      const m = marksState[stu._id]?.[sub._id] || { marksObtained: '', status: 'ATTENDED', draft: true };
                      const isLocked = !m.draft;
                      
                      return (
                        <td key={sub._id} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max={m.maxMarks}
                              className={`w-20 ${isLocked ? 'bg-slate-100' : ''}`}
                              value={m.marksObtained}
                              onChange={(e) => handleMarkChange(stu._id, sub._id, 'marksObtained', e.target.value)}
                              disabled={isLocked || m.status === 'ABSENT'}
                              placeholder={m.status === 'ABSENT' ? 'AB' : '0-30'}
                            />
                            {!isLocked && (
                              <Select 
                                value={m.status} 
                                onValueChange={(val) => {
                                  handleMarkChange(stu._id, sub._id, 'status', val);
                                  if (val === 'ABSENT') {
                                    handleMarkChange(stu._id, sub._id, 'marksObtained', '0');
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[100px] h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ATTENDED">Present</SelectItem>
                                  <SelectItem value="ABSENT">Absent</SelectItem>
                                  <SelectItem value="MALPRACTICE">Missing Paper</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            {isLocked && (
                              <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                {m.status}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            {!isFullySubmitted ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => saveMarks(false)}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  onClick={() => saveMarks(true)}
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Marks
                </Button>
              </>
            ) : (
              <Button 
                variant="outline"
                onClick={async () => {
                  // Explicitly allow "Edit -> Resubmit" per instructions by making them drafts again
                  const newMarksState = { ...marksState };
                  for (const stu in newMarksState) {
                    for (const sub in newMarksState[stu]) {
                      newMarksState[stu][sub].draft = true;
                    }
                  }
                  setMarksState(newMarksState);
                }}
              >
                Edit Marks
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
