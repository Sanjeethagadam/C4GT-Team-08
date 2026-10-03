import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
  StatusBadge,
} from "@/components/common";
import { supportService } from "@/services/supportService";

export const RemedialClasses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supportService.getMyRemedialClasses();
      setClasses(data || []);
    } catch (err) {
      setError(err.message || "Failed to load remedial classes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { header: "Subject", cell: (row) => row.subjectId?.subjectName || "-" },
    {
      header: "Date",
      cell: (row) =>
        row.scheduledDate
          ? new Date(row.scheduledDate).toLocaleDateString()
          : "-",
    },
    { header: "Time", cell: (row) => row.scheduledTime || "-" },
    { header: "Faculty", cell: (row) => row.facultyId?.name || "-" },
    { header: "Venue", cell: (row) => row.venue || "-" },
    {
      header: "Status",
      cell: (row) => (
        <StatusBadge
          status={
            row.status === "COMPLETED"
              ? "success"
              : row.status === "CANCELLED"
                ? "danger"
                : "warning"
          }
          label={row.status || "SCHEDULED"}
        />
      ),
    },
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
        <div className="bg-white rounded-2xl shadow-xs border border-[#7DA0CA]/35 overflow-hidden">
          <DataTable
            data={classes}
            columns={columns}
            emptyMessage="You have no remedial classes scheduled."
          />
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl shadow-xs border border-[#7DA0CA]/35">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C1E8FF]/40 text-[#052659] mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="text-base font-bold text-[#021024] mb-1">
            No Remedial Classes
          </h3>
          <p className="text-xs text-[#5483B3] font-medium">
            You currently have no remedial classes scheduled.
          </p>
        </div>
      )}
    </div>
  );
};
