import { useEffect, useState, useMemo } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { examinationService, type Mark } from '@/services/examinationService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const MyMarks = () => {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await examinationService.getMyMarks();
      setMarks(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load marks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = useMemo(() => {
    if (!marks || marks.length === 0) return [];
    const subjectMap: Record<string, any> = {};
    
    marks.forEach(m => {
      const subName = m.subjectId?.subjectName || 'Unknown Subject';
      const examType = (m.examinationId?.type || m.examinationId?.examType || '').toUpperCase();
      
      if (!subjectMap[subName]) {
        subjectMap[subName] = { subject: subName.substring(0, 15) + (subName.length > 15 ? '...' : ''), fullSubject: subName };
      }
      
      if (examType.includes('MID-1') || examType === 'MID 1' || examType === 'MID_1') {
        subjectMap[subName]['Mid 1'] = m.marksObtained || 0;
      } else if (examType.includes('MID-2') || examType === 'MID 2' || examType === 'MID_2') {
        subjectMap[subName]['Mid 2'] = m.marksObtained || 0;
      }
    });
    
    return Object.values(subjectMap);
  }, [marks]);

  const mid1Avg = useMemo(() => {
    const mid1Marks = marks.filter(m => {
      const et = (m.examinationId?.type || m.examinationId?.examType)?.toUpperCase() || '';
      return (et.includes('MID-1') || et === 'MID 1' || et === 'MID_1') && m.status === 'ATTENDED';
    });
    if (mid1Marks.length === 0) return 'Not Available';
    const total = mid1Marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
    return (total / mid1Marks.length).toFixed(1);
  }, [marks]);

  const mid2Avg = useMemo(() => {
    const mid2Marks = marks.filter(m => {
      const et = (m.examinationId?.type || m.examinationId?.examType)?.toUpperCase() || '';
      return (et.includes('MID-2') || et === 'MID 2' || et === 'MID_2') && m.status === 'ATTENDED';
    });
    if (mid2Marks.length === 0) return 'Not Available';
    const total = mid2Marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
    return (total / mid2Marks.length).toFixed(1);
  }, [marks]);

  const columns = [
    { header: 'Subject', cell: (row: any) => row.subjectId?.subjectName || '-' },
    { header: 'Exam Type', cell: (row: any) => row.examinationId?.type || row.examinationId?.examType || '-' },
    { header: 'Status', cell: (row: any) => row.status === 'ATTENDED' ? 'Present' : row.status === 'ABSENT' ? 'Absent' : row.status === 'MALPRACTICE' ? 'Missing Paper' : row.status || '-' },
    { header: 'Marks Obtained', cell: (row: any) => row.status === 'ATTENDED' ? `${row.marksObtained} / ${(row.examinationId?.type || row.examinationId?.examType)?.includes('MID') ? 30 : row.maxMarks}` : '-' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="My Internal Marks" 
        description="View your performance in internal examinations (Mid-1, Mid-2, etc.). Note: These are internal metrics only."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : marks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-emerald-50 rounded-3xl border-4 border-emerald-400 shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-950 text-lg font-bold">Mid-1 Average</CardTitle>
              </CardHeader>
              <CardContent>
                {mid1Avg === 'Not Available' ? (
                  <div className="text-lg font-bold text-emerald-900">Not Available</div>
                ) : (
                  <div className="text-3xl font-black text-emerald-950">{mid1Avg} <span className="text-sm font-bold text-emerald-900">/ 30</span></div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 rounded-3xl border-4 border-blue-400 shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-950 text-lg font-bold">Mid-2 Average</CardTitle>
              </CardHeader>
              <CardContent>
                {mid2Avg === 'Not Available' ? (
                  <div className="text-lg font-bold text-blue-900">Not Available</div>
                ) : (
                  <div className="text-3xl font-black text-blue-950">{mid2Avg} <span className="text-sm font-bold text-blue-900">/ 30</span></div>
                )}
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 && (
            <Card className="rounded-3xl shadow-lg border-4 border-indigo-400 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-950 font-bold text-lg">Mid-1 vs Mid-2 Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" />
                      <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 700 }} />
                      <YAxis domain={[0, 30]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 700 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: '3px solid #6366f1', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)', backgroundColor: '#ffffff', fontWeight: 700 }}
                        cursor={{ fill: '#e2e8f0' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 700 }} />
                      <Bar dataKey="Mid 1" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="Mid 2" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-white rounded-3xl shadow-lg border-4 border-indigo-400 overflow-hidden mt-6">
            <DataTable 
              data={marks} 
              columns={columns}
              emptyMessage="No marks have been published yet."
            />
          </div>
        </>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl shadow-lg border-4 border-indigo-400">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 border-4 border-indigo-300 mb-4 shadow-md">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">No Marks Available</h3>
          <p className="text-slate-700 font-medium">Your internal marks have not been published yet.</p>
        </div>
      )}
    </div>
  );
};