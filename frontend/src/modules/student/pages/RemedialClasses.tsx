import { useEffect, useState } from 'react';
import { LoadingSkeleton, ErrorState, DataTable, StatusBadge } from '@/components/common';
import { supportService, type RemedialClass } from '@/services/supportService';

export const RemedialClasses = () => {
  const [classes, setClasses] = useState<RemedialClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supportService.getMyRemedialClasses();
      setClasses(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load remedial classes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { header: 'Subject Code', cell: (row: any) => row?.subjectId?.subjectCode || '-' },
    { header: 'Subject Name', cell: (row: any) => <span className="font-bold text-slate-900">{row?.subjectId?.subjectName || '-'}</span> },
    { header: 'Date', cell: (row: any) => row?.scheduledDate ? new Date(row.scheduledDate).toLocaleDateString() : '-' },
    { header: 'Time', cell: (row: any) => row?.scheduledTime || '-' },
    { header: 'Faculty', cell: (row: any) => row?.facultyId?.name || '-' },
    { header: 'Venue', cell: (row: any) => row?.venue || '-' },
    { 
      header: 'Status', 
      cell: (row: any) => (
        <StatusBadge status={row?.status === 'COMPLETED' ? 'success' : row?.status === 'CANCELLED' ? 'danger' : 'warning'} label={row?.status || 'SCHEDULED'} />
      ) 
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border-4 border-indigo-400">
        <div className="px-8 py-6 border-b-4 border-emerald-500 bg-slate-900">
          <h1 className="text-xl font-black text-white tracking-wide">REMEDIAL CLASSES</h1>
          <p className="text-slate-300 text-sm mt-1 font-semibold">View your scheduled remedial classes for academic support.</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : classes.length > 0 ? (
        <div className="bg-white rounded-3xl shadow-lg border-4 border-indigo-400 overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-slate-200 bg-slate-100">
            <h3 className="font-black text-slate-900 text-sm">Scheduled Classes</h3>
          </div>
          <DataTable 
            data={classes} 
            columns={columns}
            emptyMessage="You have no remedial classes scheduled."
          />
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl shadow-lg border-4 border-indigo-400">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 mb-4 shadow-md">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">No Remedial Classes</h3>
          <p className="text-slate-600 font-medium text-sm">You currently have no remedial classes scheduled.</p>
        </div>
      )}
    </div>
  );
};