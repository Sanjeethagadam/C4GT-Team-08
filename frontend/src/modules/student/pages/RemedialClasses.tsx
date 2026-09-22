import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable, StatusBadge } from '@/components/common';
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
    { header: 'Subject', cell: (row: any) => row.subjectId?.subjectName || '-' },
    { header: 'Date', cell: (row: any) => row.scheduledDate ? new Date(row.scheduledDate).toLocaleDateString() : '-' },
    { header: 'Time', cell: (row: any) => row.scheduledTime || '-' },
    { header: 'Faculty', cell: (row: any) => row.facultyId?.name || '-' },
    { header: 'Venue', cell: (row: any) => row.venue || '-' },
    { 
      header: 'Status', 
      cell: (row: any) => (
        <StatusBadge status={row.status === 'COMPLETED' ? 'success' : row.status === 'CANCELLED' ? 'danger' : 'warning'} label={row.status || 'SCHEDULED'} />
      ) 
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Remedial Classes" 
        description="View your scheduled remedial classes for academic support."
      />

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : classes.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <DataTable 
            data={classes} 
            columns={columns}
            emptyMessage="You have no remedial classes scheduled."
          />
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-1">No Remedial Classes</h3>
          <p className="text-slate-500">You currently have no remedial classes scheduled.</p>
        </div>
      )}
    </div>
  );
};
