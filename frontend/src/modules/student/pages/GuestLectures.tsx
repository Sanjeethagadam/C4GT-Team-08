import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { supportService, type GuestLecture } from '@/services/supportService';

export const GuestLectures = () => {
  const [lectures, setLectures] = useState<GuestLecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supportService.getMyGuestLectures();
      setLectures(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load guest lectures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { header: 'Title', cell: (row: any) => row.topic || row.title || 'Untitled Lecture' },
    { header: 'Speaker', cell: (row: any) => row.resourcePersonName || row.speakerName || 'TBA' },
    { header: 'Date', cell: (row: any) => row.scheduledDate ? new Date(row.scheduledDate).toLocaleDateString() : 'TBA' },
    { header: 'Time', cell: (row: any) => row.scheduledTime || 'TBA' },
    { header: 'Venue', cell: (row: any) => row.venue || 'TBA' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Upcoming Guest Lectures" 
        description="View scheduled academic guest lectures and workshops."
      />

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : lectures.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <DataTable 
            data={lectures} 
            columns={columns}
            emptyMessage="No guest lectures are currently scheduled."
          />
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <span className="text-2xl">🎤</span>
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-1">No Upcoming Lectures</h3>
          <p className="text-slate-500">There are currently no guest lectures scheduled for your batch.</p>
        </div>
      )}
    </div>
  );
};
