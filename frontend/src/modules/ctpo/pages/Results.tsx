import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, StatusBadge } from '@/components/common';
import { ctpoService } from '@/services/ctpoService';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const getAvailableSemesters = (year: string | number) => {
  const y = String(year);
  if (y === '4') return ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'];
  if (y === '3') return ['1-1', '1-2', '2-1', '2-2'];
  if (y === '2') return ['1-1'];
  return ['1-1', '1-2']; // default for year 1 or fallback
};

export const Results = () => {
  const [results, setResults] = useState<any[]>([]);
  const [ctpoYear, setCtpoYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  const loadData = async (semester?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ctpoService.getResults(semester);
      if (data && data.year) {
        setCtpoYear(data.year);
        setResults(data.results || []);
        
        if (!semester) {
          const availableSemesters = getAvailableSemesters(data.year);
          if (availableSemesters.length > 0) {
            setSelectedSemester(availableSemesters[availableSemesters.length - 1]);
          }
        }
      } else {
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load class results');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSemester) {
      loadData(selectedSemester);
    } else {
      loadData();
    }
  }, [selectedSemester]);

  const toggleRow = (studentId: string) => {
    setExpandedRows(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const availableSemesters = useMemo(() => getAvailableSemesters(ctpoYear), [ctpoYear]);

  // Group by student for selected semester
  const groupedResults = useMemo(() => {
    const map: Record<string, { student: any, results: any[], overallStatus: string }> = {};
    
    const filteredResults = results.filter(r => r.semesterId?.semesterCode === selectedSemester);
    
    filteredResults.forEach(r => {
      const sId = r.studentId?._id;
      if (!sId) return;

      if (!map[sId]) {
        map[sId] = {
          student: r.studentId,
          results: [],
          overallStatus: 'PASS'
        };
      }
      
      const existingResults = map[sId].results;
      const isDuplicate = existingResults.some(existing => {
        const rName = r.subjectId?.subjectName || (r as any).subjectName || '';
        const exName = existing.subjectId?.subjectName || (existing as any).subjectName || '';
        const rNorm = rName.toUpperCase().replace(/&/g, ' & ').replace(/\s+/g, ' ').trim();
        const exNorm = exName.toUpperCase().replace(/&/g, ' & ').replace(/\s+/g, ' ').trim();
        
        const rCode = (r.subjectId?.subjectCode || (r as any).subjectCode || '').toUpperCase();
        const exCode = (existing.subjectId?.subjectCode || (existing as any).subjectCode || '').toUpperCase();
        
        const rIsLab = rName.toUpperCase().includes(' LAB') || rName.toUpperCase().includes('LABORATORY') || rCode.includes('LAB') || rCode.endsWith('P');
        const exIsLab = exName.toUpperCase().includes(' LAB') || exName.toUpperCase().includes('LABORATORY') || exCode.includes('LAB') || exCode.endsWith('P');
        
        if (rNorm === exNorm && rIsLab === exIsLab && rNorm !== '') {
            return true;
        }

        const sameId = existing.subjectId?._id && r.subjectId?._id && existing.subjectId._id === r.subjectId._id;
        const sameCode = existing.subjectId?.subjectCode && r.subjectId?.subjectCode && existing.subjectId.subjectCode === r.subjectId.subjectCode;
        
        if (r.subjectId?._id && existing.subjectId?._id) {
            return sameId;
        } else if (r.subjectId?.subjectCode && existing.subjectId?.subjectCode) {
            return sameCode;
        }
        return false;
      });

      if (!isDuplicate) {
        map[sId].results.push(r);
        if (r.resultStatus === 'FAIL' || r.resultStatus === 'ABSENT') {
          map[sId].overallStatus = 'FAIL';
        }
      }
    });

    return Object.values(map).sort((a, b) => a.student.rollNo.localeCompare(b.student.rollNo));
  }, [results, selectedSemester]);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Class Results" 
        description="Official university semester results for your class."
      />
      
      {/* Highlighted Semester Filter Container with Soft Gradient */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/40 p-4 rounded-3xl shadow-md border-2 border-indigo-200 flex items-center justify-between">
        <h3 className="font-bold text-slate-700">Select Semester</h3>
        <select 
          className="border-2 border-indigo-200 rounded-2xl px-4 py-2 bg-white text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          {availableSemesters.map(sem => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>
      </div>

      {/* Main Results Table Container with Custom Rounded Corners & Borders */}
      <div className="bg-white rounded-3xl shadow-md border-2 border-indigo-100 overflow-hidden transition-all hover:shadow-lg">
        {groupedResults.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No official university result data available for this semester.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-indigo-50/60 border-b border-indigo-100">
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="font-bold text-slate-700">Roll No</TableHead>
                <TableHead className="font-bold text-slate-700">Student Name</TableHead>
                <TableHead className="font-bold text-slate-700">Total Subjects</TableHead>
                <TableHead className="font-bold text-slate-700">Overall Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-indigo-50">
              {groupedResults.map(({ student, results: studentResults, overallStatus }) => {
                const isExpanded = expandedRows[student._id];
                return (
                  <React.Fragment key={student._id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-slate-50/60 transition-colors"
                      onClick={() => toggleRow(student._id)}
                    >
                      <TableCell className="p-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800">{student.rollNo}</TableCell>
                      <TableCell className="font-medium text-slate-700">{student.name}</TableCell>
                      <TableCell className="font-medium text-slate-600">{studentResults.length}</TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={overallStatus === 'PASS' ? 'success' : 'danger'} 
                          label={overallStatus} 
                        />
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow className="bg-indigo-50/20 hover:bg-indigo-50/20">
                        <TableCell colSpan={5} className="p-0 border-b border-indigo-100">
                          <div className="p-4 pl-12">
                            <Table className="bg-white border-2 border-indigo-100 rounded-2xl overflow-hidden shadow-sm">
                              <TableHeader className="bg-indigo-50/40 border-b border-indigo-100">
                                <TableRow>
                                  <TableHead className="py-2 font-bold text-slate-700">Subject</TableHead>
                                  <TableHead className="py-2 font-bold text-slate-700">Grade</TableHead>
                                  <TableHead className="py-2 font-bold text-slate-700">Grade Point</TableHead>
                                  <TableHead className="py-2 font-bold text-slate-700">Credits</TableHead>
                                  <TableHead className="py-2 font-bold text-slate-700">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody className="divide-y divide-slate-100">
                                {studentResults.map((r) => (
                                  <TableRow key={r._id} className="hover:bg-slate-50/40">
                                    <TableCell className="py-2 font-medium text-slate-700">{r.subjectId?.subjectName}</TableCell>
                                    <TableCell className="py-2 font-semibold text-slate-800">{r.grade || '-'}</TableCell>
                                    <TableCell className="py-2 text-slate-600">{r.gradePoint !== undefined && r.gradePoint !== null ? r.gradePoint : '-'}</TableCell>
                                    <TableCell className="py-2 text-slate-600">{r.credits !== undefined ? r.credits : '-'}</TableCell>
                                    <TableCell className="py-2">
                                      <StatusBadge 
                                        status={r.resultStatus === 'PASS' ? 'success' : r.resultStatus === 'FAIL' ? 'danger' : 'warning'} 
                                        label={r.resultStatus} 
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};