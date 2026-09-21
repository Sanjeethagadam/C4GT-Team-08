import { useEffect, useState } from 'react';
import { LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
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
    { header: 'Title', cell: (row: any) => <span className="font-bold text-slate-900">{row.topic || row.title || 'Untitled Lecture'}</span> },
    { header: 'Speaker', cell: (row: any) => row.resourcePersonName || row.speakerName || 'TBA' },
    { header: 'Date', cell: (row: any) => row.scheduledDate ? new Date(row.scheduledDate).toLocaleDateString() : 'TBA' },
    { header: 'Time', cell: (row: any) => row.scheduledTime || 'TBA' },
    { header: 'Venue', cell: (row: any) => row.venue || 'TBA' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border-4 border-indigo-400">
        <div className="px-8 py-6 border-b-4 border-emerald-500 bg-slate-900">
          <h1 className="text-xl font-black text-white tracking-wide">UPCOMING GUEST LECTURES</h1>
          <p className="text-slate-300 text-sm mt-1 font-semibold">View scheduled academic guest lectures and workshops.</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : lectures.length > 0 ? (
        <div className="bg-white rounded-3xl shadow-md border-2 border-slate-300 overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-slate-200 bg-slate-100">
            <h3 className="font-black text-slate-900 text-sm">Scheduled Lectures</h3>
          </div>
          <DataTable 
            data={lectures} 
            columns={columns}
            emptyMessage="No guest lectures are currently scheduled."
          />
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl shadow-md border-2 border-slate-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 mb-4 shadow-sm">
            <span className="text-2xl">🎤</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">No Upcoming Lectures</h3>
          <p className="text-slate-600 font-medium text-sm">There are currently no guest lectures scheduled for your batch.</p>
        </div>
      )}
    </div>
  );
};