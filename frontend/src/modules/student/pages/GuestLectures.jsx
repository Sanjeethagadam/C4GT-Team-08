import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
} from "@/components/common";
import { supportService } from "@/services/supportService";

export const GuestLectures = () => {
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supportService.getMyGuestLectures();
      setLectures(data || []);
    } catch (err) {
      setError(err.message || "Failed to load guest lectures");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      header: "Title",
      cell: (row) => row.topic || row.title || "Untitled Lecture",
    },
    {
      header: "Speaker",
      cell: (row) => row.resourcePersonName || row.speakerName || "TBA",
    },
    {
      header: "Date",
      cell: (row) =>
        row.scheduledDate
          ? new Date(row.scheduledDate).toLocaleDateString()
          : "TBA",
    },
    { header: "Time", cell: (row) => row.scheduledTime || "TBA" },
    { header: "Venue", cell: (row) => row.venue || "TBA" },
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
        <div className="bg-white rounded-2xl shadow-xs border border-[#7DA0CA]/35 overflow-hidden">
          <DataTable
            data={lectures}
            columns={columns}
            emptyMessage="No guest lectures are currently scheduled."
          />
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl shadow-xs border border-[#7DA0CA]/35">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C1E8FF]/40 text-[#052659] mb-4">
            <span className="text-2xl">🎤</span>
          </div>
          <h3 className="text-base font-bold text-[#021024] mb-1">
            No Upcoming Lectures
          </h3>
          <p className="text-xs text-[#5483B3] font-medium">
            There are currently no guest lectures scheduled for your batch.
          </p>
        </div>
      )}
    </div>
  );
};
