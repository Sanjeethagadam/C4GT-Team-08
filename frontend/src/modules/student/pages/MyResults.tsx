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
      setProfile(profileData || null);
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
    if (!profile || typeof profile.year !== 'number') return ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
    
    if (profile.year === 4) return ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
    if (profile.year === 3) return ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'];
    if (profile.year === 2) return ['1-1', '1-2', '2-1', '2-2'];
    if (profile.year === 1) return ['1-1', '1-2'];
    
    return ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
  }, [profile]);

  const groupedSemesters = useMemo(() => {
    const groups: Record<string, Result[]> = {};
    
    expectedSemesters.forEach(sem => {
      groups[sem] = [];
    });
    
    if (results && Array.isArray(results) && results.length > 0) {
      results.forEach(r => {
        if (!r) return;
        const semCode = r.semesterId?.semesterCode || 'Unknown Semester';
        if (!groups[semCode]) {
          groups[semCode] = [];
        }
        
        const isDuplicate = groups[semCode].some(existing => {
          if (!existing) return false;
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
              return Boolean(sameId);
          } else if (r.subjectId?.subjectCode && existing.subjectId?.subjectCode) {
              return Boolean(sameCode);
          }
          return false;
        });

        if (!isDuplicate) {
          groups[semCode].push(r);
        }
      });
    }
    
    return groups;
  }, [results, expectedSemesters]);

  const semesters = Object.keys(groupedSemesters).sort();
  const columns = [
    { header: 'Subject Code', cell: (row: Result) => row?.subjectId?.subjectCode || '-' },
    { header: 'Subject Name', cell: (row: Result) => <span className="font-bold text-slate-900">{row?.subjectId?.subjectName || '-'}</span> },
    { header: 'Credits', cell: (row: Result) => row?.credits !== undefined && row?.credits !== null ? row.credits : '-' },
    { header: 'Grade', cell: (row: Result) => row?.grade || '-' },
    { header: 'Grade Point', cell: (row: Result) => row?.gradePoint !== undefined && row?.gradePoint !== null ? row.gradePoint : '-' },
    { header: 'Status', cell: (row: Result) => {
        const status = row?.resultStatus;
        return <span className={`font-bold ${status === 'PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{status || '-'}</span>;
    }}
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border-4 border-indigo-400">
        <div className="px-8 py-6 border-b-4 border-emerald-500 bg-slate-900">
          <h1 className="text-xl font-black text-white tracking-wide">STUDENT ACADEMIC PERFORMANCE</h1>
          <p className="text-slate-300 text-sm mt-1 font-semibold">Semester-wise results and historical academic status</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          <div className="bg-white rounded-3xl shadow-lg border-4 border-indigo-400 p-8 mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-4 border-b-2 border-slate-200 pb-3">Student Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-bold text-slate-900 w-32">Student ID</span>
                <span className="text-slate-700 font-semibold">{profile?.rollNo || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-bold text-slate-900 w-32">Student Name</span>
                <span className="text-slate-700 font-semibold uppercase">{profile?.name || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-bold text-slate-900 w-32">Campus Name</span>
                <span className="text-slate-700 font-semibold">{(profile?.campusId as any)?.name || 'Kakinada Institute Of Engineering And Technology CoED'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-bold text-slate-900 w-32">Degree Name</span>
                <span className="text-slate-700 font-semibold">Bachelor of Technology</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-bold text-slate-900 w-32">Branch Name</span>
                <span className="text-slate-700 font-semibold">{(profile?.branchId as any)?.name || '-'}</span>
              </div>
            </div>
          </div>

          {semesters.length > 0 ? (
            <div className="space-y-6">
              {semesters.map(sem => {
                const semResults = groupedSemesters[sem] || [];
                const gpaData = calculateGPA(semResults);
                return (
                  <div key={sem} className="bg-white rounded-3xl shadow-lg border-4 border-indigo-400 overflow-hidden">
                    {semResults.length > 0 ? (
                      <>
                        <div className="bg-slate-100 text-slate-900 font-black px-6 py-4 text-sm border-b-2 border-slate-200 flex justify-between items-center">
                          <span>Semester {sem.replace('-', '')}</span>
                        </div>
                        <DataTable 
                          data={semResults} 
                          columns={columns}
                          emptyMessage="No official results found for this semester."
                        />
                        <div className="flex justify-end items-center py-4 px-8 bg-slate-50 border-t-2 border-slate-200 text-sm font-bold text-slate-800 gap-8">
                          <span>Total Credits: {gpaData?.credits || 0}</span>
                          <span>
                            {semResults.some(r => r?.isOfficial) ? 'Official SGPA: ' : 'Derived SGPA: '}
                            {gpaData?.gpa || '0.00'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-slate-100 text-slate-900 font-black px-6 py-4 text-sm border-b-2 border-slate-200">
                          Semester {sem.replace('-', '')}
                        </div>
                        <div className="bg-white p-12 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 mb-3 shadow-md">
                            <span className="text-2xl">🎓</span>
                          </div>
                          <p className="text-slate-600 font-medium text-sm">No official university result data available for this semester.</p>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              
              {/* Overall Summary */}
              {(() => {
                const allUniqueResults = Object.values(groupedSemesters).flat().filter(Boolean);
                const officialResultsOnly = allUniqueResults.filter(r => !r?.isHistorical);
                const officialGpaData = calculateGPA(officialResultsOnly);
                const derivedGpaData = calculateGPA(allUniqueResults);
                
                return (
                  <div className="bg-slate-900 rounded-3xl shadow-xl border-4 border-indigo-400 overflow-hidden mt-8 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-700">
                      <div className="flex flex-col items-center justify-center py-2">
                        <span className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Total Official Credits</span>
                        <span className="text-3xl font-black text-white">{officialGpaData?.credits || 0}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2">
                        <span className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Official CGPA</span>
                        <span className="text-4xl font-black text-white">{officialGpaData?.gpa || '0.00'}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2 pl-4">
                        <span className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Derived Academic CGPA</span>
                        <span className="text-4xl font-black text-emerald-400">{derivedGpaData?.gpa || '0.00'}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-2 pl-4">
                        <span className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Percentage</span>
                        <span className="text-3xl font-black text-slate-200">
                          {officialGpaData?.credits > 0 ? ((Number(officialGpaData.gpa) - 0.75) * 10).toFixed(2) + '%' : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl shadow-lg border-4 border-indigo-400">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 mb-4 shadow-md">
                <span className="text-2xl">🎓</span>
              </div>
              <p className="text-slate-600 font-medium">No official university result data available.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};