import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
  StatusBadge,
} from "@/components/common";
import { resultService } from "@/services/resultService";
import { useAuth } from "@/providers/AuthProvider";

export const AtRiskStudents = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const scopeFilter = { sectionId: user?.scope?.sectionId };
      const data = await resultService.getAllRiskProfiles(scopeFilter);
      setProfiles(data);
    } catch (err) {
      setError(err.message || "Failed to load risk profiles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const getRiskStatusColor = (level) => {
    switch (level) {
      case "CRITICAL":
        return "danger";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "warning"; // or some other styling
      case "LOW":
        return "success";
      default:
        return "neutral";
    }
  };

  const columns = [
    { header: "Roll Number", cell: (row) => row.studentId?.rollNo || "-" },
    { header: "Name", cell: (row) => row.studentId?.name || "-" },
    {
      header: "Risk Level",
      cell: (row) => (
        <StatusBadge
          status={getRiskStatusColor(row.riskLevel)}
          label={row.riskLevel}
        />
      ),
    },
    {
      header: "Risk Factors",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.factors?.map((factor, idx) => (
            <span
              key={idx}
              className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs"
            >
              {factor}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="At-Risk Students"
        description="Monitor students in your class who require academic attention."
      />

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <DataTable
            data={profiles}
            columns={columns}
            emptyMessage="No at-risk students found."
          />
        </div>
      )}
    </>
  );
};
