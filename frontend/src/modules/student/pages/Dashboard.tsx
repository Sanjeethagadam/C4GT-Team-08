import { useEffect, useState } from 'react';
import { StatCard, LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { useAuth } from '@/providers/AuthProvider';
import { studentService, type StudentProfile } from '@/services/studentService';
import { examinationService, type Mark } from '@/services/examinationService';
import { supportService, type RemedialClass } from '@/services/supportService';
import { analyticsService } from '@/services/analyticsService';
import { AlertTriangle, BookOpen, Users, Activity, UserCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/utils/urlUtils';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [, setForceUpdate] = useState(0);
  
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
    
    const handleProfileUpdate = () => {
        setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
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
      <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center gap-6 p-8">
            <Avatar className="flex-shrink-0 w-24 h-24 rounded-full bg-indigo-100 border-4 border-white shadow-sm overflow-hidden">
              <AvatarImage src={getAvatarUrl(user?.avatarFileId || user?.avatar)} alt="Profile" />
              <AvatarFallback className="bg-transparent flex items-center justify-center">
                <UserCircle className="w-16 h-16 text-indigo-400" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{profile?.name || user?.firstName || 'Student Profile'}</h2>
              <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {profile?.rollNo || 'N/A'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {(profile?.branchId as any)?.name || 'N/A'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Year {profile?.year || 'N/A'} • Sem {(profile?.semesterId as any)?.semesterCode || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {activeBacklogsCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl flex items-start gap-4 shadow-sm">
          <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0 text-rose-500" />
          <div>
            <h4 className="font-semibold text-rose-800">Action Required: Active Backlogs</h4>
            <p className="text-sm mt-1 text-rose-600">You have {activeBacklogsCount} active backlog{activeBacklogsCount !== 1 ? 's' : ''} from previous semesters. Please consult the Remedial Classes schedule or apply for supply examinations via the university portal.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Backlogs" 
          value={activeBacklogsCount} 
          icon={AlertTriangle}
          contextLine="Current active count"
          contextType={activeBacklogsCount > 0 ? "warning" : "success"}
        />
        <StatCard 
          title="Calculated Risk" 
          value={currentRisk} 
          icon={Activity}
          contextLine="Based on backlog count"
          contextType={currentRisk === 'HIGH' ? "danger" : currentRisk === 'MEDIUM' ? "warning" : "success"}
        />
        <StatCard 
          title="Remedial Classes" 
          value={remedialClasses.length} 
          icon={Users}
          contextLine="Assigned to you"
          contextType="success"
        />
        <StatCard 
          title="Internal Subjects" 
          value={new Set(marks.map(m => m.subjectId?._id)).size || 0} 
          icon={BookOpen}
          contextLine="With marks recorded"
          contextType="neutral"
        />
      </div>

      {/* Semester Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
        <h3 className="font-semibold text-slate-800 mb-6">Academic Progress</h3>
        <div className="flex items-center justify-between w-full relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
          {['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'].map((sem, idx) => {
            const isCompleted = profile?.year ? (idx < (profile.year - 1) * 2 + (parseInt((profile?.semesterId as any)?.semesterCode?.split('-')[1] || '1') - 1)) : false;
            const isCurrent = profile?.year ? (idx === (profile.year - 1) * 2 + (parseInt((profile?.semesterId as any)?.semesterCode?.split('-')[1] || '1') - 1)) : false;
            return (
              <div key={sem} className="flex flex-col items-center bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 
                  ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
                    isCurrent ? 'bg-white border-indigo-500 text-indigo-600 ring-4 ring-indigo-50' : 
                    'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {isCompleted ? '✓' : sem}
                </div>
                <span className={`text-[10px] mt-2 font-medium ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {isCurrent ? 'Current' : sem}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Recent Internal Marks</h3>
          <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Current Semester</span>
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
