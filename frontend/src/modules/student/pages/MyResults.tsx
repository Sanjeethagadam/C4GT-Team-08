import { useEffect, useState, useMemo } from 'react';
import { LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { resultService, type Result } from '@/services/resultService';
import { studentService, type StudentProfile } from '@/services/studentService';
import { calculateGPA } from '@/utils/gpaUtils';

export const MyResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resultsData, profileData] = await Promise.all([
        resultService.getMyResults(),
        studentService.getProfile()
      ]);
      setResults(resultsData || []);
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const expectedSemesters = useMemo(() => {
    if (!results || results.length === 0) return [];
    const sems = new Set<string>();
    results.forEach(r => {
      const code = r.semesterId?.semesterCode;
      if (code && typeof code === 'string') {
        sems.add(code);
      }
    });
    return Array.from(sems).sort();
  }, [results]);

  const groupedSemesters = useMemo(() => {
    const groups: Record<string, Result[]> = {};
    
    // Initialize all expected semesters with empty arrays
    expectedSemesters.forEach(sem => {
      groups[sem] = [];
    });
    
    if (results && results.length > 0) {
      results.forEach(r => {
        const semCode = r.semesterId?.semesterCode || 'Unknown Semester';
        if (groups[semCode] !== undefined) {
          const isDuplicate = groups[semCode].some(existing => {
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
            groups[semCode].push(r);
          }
        }
      });
    }
    
    return groups;
  }, [results, expectedSemesters]);

  const semesters = Object.keys(groupedSemesters).sort();
  const columns = [
    { header: 'Subject Code', cell: (row: Result) => row.subjectId?.subjectCode || '-' },
    { header: 'Subject Name', cell: (row: Result) => <span className="font-medium text-slate-800">{row.subjectId?.subjectName || '-'}</span> },
    { header: 'Credits', cell: (row: Result) => row.credits !== undefined && row.credits !== null ? row.credits : '-' },
    { header: 'Grade', cell: (row: Result) => row.grade || '-' },
    { header: 'Grade Point', cell: (row: Result) => row.gradePoint !== undefined && row.gradePoint !== null ? row.gradePoint : '-' },
    { header: 'Status', cell: (row: Result) => {
        if (row.isHistorical) {
            return <span className={`font-semibold ${row.resultStatus === 'PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{row.resultStatus}</span>;
        }
        return <span className={`font-semibold ${row.resultStatus === 'PASS' ? 'text-emerald-600' : (row.resultStatus === 'FAIL' ? 'text-red-600' : '')}`}>{row.resultStatus}</span>;
    }}
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-800 rounded-t-lg px-6 py-5 border-b-4 border-emerald-500">
        <h1 className="text-xl font-bold text-white tracking-wide">STUDENT ACADEMIC PERFORMANCE</h1>
        <p className="text-slate-300 text-sm mt-1">Semester-wise results and historical academic status</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Student Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold text-slate-800 w-32">Student ID</span>
                <span className="text-slate-600">{profile?.rollNo || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold text-slate-800 w-32">Student Name</span>
                <span className="text-slate-600 uppercase">{profile?.name || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold text-slate-800 w-32">Campus Name</span>
                <span className="text-slate-600">{(profile?.campusId as any)?.name || 'Kakinada Institute Of Engineering And Technology CoED'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold text-slate-800 w-32">Degree Name</span>
                <span className="text-slate-600">Bachelor of Technology</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold text-slate-800 w-32">Branch Name</span>
                <span className="text-slate-600">{(profile?.branchId as any)?.name || '-'}</span>
              </div>
            </div>
          </div>

          {semesters.length > 0 ? (
            <div className="space-y-6">
              {semesters.map(sem => (
                <div key={sem} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {groupedSemesters[sem].length > 0 ? (
                    <>
                      <div className="bg-slate-100 text-slate-800 font-bold px-5 py-3 text-sm border-b border-slate-200 flex justify-between items-center">
                        <span>Semester {sem.replace('-', '')}</span>
                      </div>
                      <DataTable 
                        data={groupedSemesters[sem]} 
                        columns={columns}
                        emptyMessage="No official results found for this semester."
                      />
                      <div className="flex justify-end items-center py-3 px-6 bg-slate-50 border-t border-slate-200 text-sm font-semibold text-slate-700 gap-8">
                        <span>Total Credits: {calculateGPA(groupedSemesters[sem]).credits}</span>
                        <span>
                          {groupedSemesters[sem].some(r => r.isOfficial) ? 'Official SGPA: ' : 'Derived SGPA: '}
                          {calculateGPA(groupedSemesters[sem]).gpa}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-100 text-slate-800 font-bold px-5 py-3 text-sm border-b border-slate-200">
                        Semester {sem.replace('-', '')}
                      </div>
                      <div className="bg-white p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                          <span className="text-xl">🎓</span>
                        </div>
                        <p className="text-slate-500 text-sm">No official university result data available for this semester.</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Overall Summary */}
              {(() => {
                const allUniqueResults = Object.values(groupedSemesters).flat();
                const officialResultsOnly = allUniqueResults.filter(r => !r.isHistorical);
                const officialGpaData = calculateGPA(officialResultsOnly);
                const derivedGpaData = calculateGPA(allUniqueResults);
                
                return (
                  <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden mt-8 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-700">
                      <div className="flex flex-col items-center justify-center py-2">
                        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Official Credits</span>
                        <span className="text-3xl font-bold text-white">{officialGpaData.credits > 0 ? officialGpaData.credits : '-'}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2">
                        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Official CGPA</span>
                        <span className="text-4xl font-extrabold text-white">{officialGpaData.credits > 0 ? officialGpaData.gpa : '-'}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2 pl-4">
                        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Calculated CGPA</span>
                        <span className="text-4xl font-extrabold text-emerald-400">{derivedGpaData.gpa}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2 pl-4">
                        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Percentage</span>
                        <span className="text-3xl font-bold text-slate-300">
                          {officialGpaData.credits > 0 ? ((Number(officialGpaData.gpa) - 0.75) * 10).toFixed(2) + '%' : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <p className="text-slate-500">No official university result data available.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
