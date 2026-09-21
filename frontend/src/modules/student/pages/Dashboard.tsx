import { useEffect, useState } from 'react';
import { StatCard, LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { useAuth } from '@/providers/AuthProvider';
import { studentService, type StudentProfile } from '@/services/studentService';
import { examinationService, type Mark } from '@/services/examinationService';
import { supportService, type RemedialClass } from '@/services/supportService';
import { analyticsService } from '@/services/analyticsService';
import { AlertTriangle, BookOpen, Users, Activity, UserCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const StudentDashboard = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [remedialClasses, setRemedialClasses] = useState<RemedialClass[]>([]);
  const [personalAnalytics, setPersonalAnalytics] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, marksRes, remedialRes, analyticsRes] = await Promise.allSettled([
        studentService.getProfile(),
        examinationService.getMyMarks(),
        supportService.getMyRemedialClasses(),
        analyticsService.getStudentPersonalAnalytics()
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (marksRes.status === 'fulfilled') setMarks(marksRes.value || []);
      if (remedialRes.status === 'fulfilled') setRemedialClasses(remedialRes.value || []);
      if (analyticsRes.status === 'fulfilled') setPersonalAnalytics(analyticsRes.value);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
        <LoadingSkeleton type="table" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  const backlogs = personalAnalytics?.backlogs || [];
  const activeBacklogsCount = backlogs.length;
  let currentRisk = 'LOW';
  if (activeBacklogsCount >= 5) currentRisk = 'HIGH';
  else if (activeBacklogsCount >= 2) currentRisk = 'MEDIUM';
  
  const marksColumns = [
    { header: 'Subject', cell: (row: Mark) => row.subjectId?.subjectName || '-' },
    { header: 'Code', cell: (row: Mark) => row.subjectId?.subjectCode || '-' },
    { header: 'Exam Type', cell: (row: Mark) => row.examinationId?.type || row.examinationId?.examType || '-' },
    { header: 'Marks (Internal)', cell: (row: Mark) => row.status === 'ATTENDED' ? `${row.marksObtained} / ${(row.examinationId?.type || row.examinationId?.examType)?.includes('MID') ? 30 : row.maxMarks}` : row.status || '-' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Card Section */}
      <Card className="bg-gradient-to-br from-indigo-50/70 to-white rounded-3xl border-2 border-indigo-200 shadow-md overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center gap-6 p-8">
            <div className="flex-shrink-0 w-24 h-24 rounded-full bg-indigo-100 border-4 border-white shadow-sm flex items-center justify-center">
              <UserCircle className="w-16 h-16 text-indigo-500" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{profile?.name || user?.firstName || 'Student Profile'}</h2>
              <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  {profile?.rollNo || 'N/A'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {(profile?.branchId as any)?.name || 'N/A'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Year {profile?.year || 'N/A'} • Sem {(profile?.semesterId as any)?.semesterCode || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {activeBacklogsCount > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 text-rose-700 px-6 py-4 rounded-3xl flex items-start gap-4 shadow-md">
          <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0 text-rose-500" />
          <div>
            <h4 className="font-bold text-rose-800">Action Required: Active Backlogs</h4>
            <p className="text-sm mt-1 text-rose-600 font-medium">You have {activeBacklogsCount} active backlog{activeBacklogsCount !== 1 ? 's' : ''} from previous semesters. Please consult the Remedial Classes schedule or apply for supply examinations via the university portal.</p>
          </div>
        </div>
      )}

      {/* Stat Cards Grid - Each StatCard uses rounded-3xl and border styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-3xl border-2 border-indigo-200 shadow-md hover:shadow-lg transition-all bg-white overflow-hidden">
          <StatCard 
            title="Active Backlogs" 
            value={activeBacklogsCount} 
            icon={AlertTriangle}
            contextLine="Current active count"
            contextType={activeBacklogsCount > 0 ? "warning" : "success"}
          />
        </div>
        <div className="rounded-3xl border-2 border-indigo-200 shadow-md hover:shadow-lg transition-all bg-white overflow-hidden">
          <StatCard 
            title="Calculated Risk" 
            value={currentRisk} 
            icon={Activity}
            contextLine="Based on backlog count"
            contextType={currentRisk === 'HIGH' ? "danger" : currentRisk === 'MEDIUM' ? "warning" : "success"}
          />
        </div>
        <div className="rounded-3xl border-2 border-indigo-200 shadow-md hover:shadow-lg transition-all bg-white overflow-hidden">
          <StatCard 
            title="Remedial Classes" 
            value={remedialClasses.length} 
            icon={Users}
            contextLine="Assigned to you"
            contextType="success"
          />
        </div>
        <div className="rounded-3xl border-2 border-indigo-200 shadow-md hover:shadow-lg transition-all bg-white overflow-hidden">
          <StatCard 
            title="Internal Subjects" 
            value={new Set(marks.map(m => m.subjectId?._id)).size || 0} 
            icon={BookOpen}
            contextLine="With marks recorded"
            contextType="neutral"
          />
        </div>
      </div>

      {/* Semester Timeline */}
      <div className="bg-white rounded-3xl shadow-md border-2 border-indigo-200 overflow-hidden p-6 transition-all hover:shadow-lg">
        <h3 className="font-bold text-slate-800 mb-6 text-lg">Academic Progress</h3>
        <div className="flex items-center justify-between w-full relative px-2">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-indigo-100 -z-10 -translate-y-1/2"></div>
          {['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'].map((sem, idx) => {
            const isCompleted = profile?.year ? (idx < (profile.year - 1) * 2 + (parseInt((profile?.semesterId as any)?.semesterCode?.split('-')[1] || '1') - 1)) : false;
            const isCurrent = profile?.year ? (idx === (profile.year - 1) * 2 + (parseInt((profile?.semesterId as any)?.semesterCode?.split('-')[1] || '1') - 1)) : false;
            return (
              <div key={sem} className="flex flex-col items-center bg-white px-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 
                    isCurrent ? 'bg-white border-indigo-600 text-indigo-700 ring-4 ring-indigo-100 shadow-md' : 
                    'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {isCompleted ? '✓' : sem}
                </div>
                <span className={`text-xs mt-2 font-semibold ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {isCurrent ? 'Current' : sem}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Internal Marks Table Section */}
      <div className="bg-white rounded-3xl shadow-md border-2 border-indigo-200 overflow-hidden transition-all hover:shadow-lg">
        <div className="px-6 py-4 border-b-2 border-indigo-100 bg-indigo-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Recent Internal Marks</h3>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">Current Semester</span>
        </div>
        <div className="p-0">
          <DataTable 
            data={marks.slice(0, 5)} 
            columns={marksColumns}
            emptyMessage="No internal marks recorded yet."
          />
        </div>
      </div>
    </div>
  );
};