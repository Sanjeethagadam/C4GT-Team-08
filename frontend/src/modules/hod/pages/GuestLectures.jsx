import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  ChartCard,
} from "@/components/common";
import { HODFilterBar } from "../components/HODFilterBar";
import { analyticsService } from "@/services/analyticsService";
import {
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const GuestLectures = () => {
  const [filters, setFilters] = useState({});
  const [remedialStats, setRemedialStats] = useState([]);
  const [guestLectureStats, setGuestLectureStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async (currentFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const [remedialData, guestData] = await Promise.all([
        analyticsService.getRemedialStats(currentFilters),
        analyticsService.getGuestLectureStats(currentFilters),
      ]);
      setRemedialStats(remedialData || []);
      setGuestLectureStats(guestData || []);
    } catch (err) {
      setError(err.message || "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadData(filters);
    }
  }, [filters]);

  const COLORS = {
    SCHEDULED: "#3b82f6",
    COMPLETED: "#10b981",
    CANCELLED: "#ef4444",
  };

  return (
    <>
      <PageHeader
        title="Guest Lectures"
        description="Monitor guest lectures arranged for students."
      />

      <HODFilterBar onFilterChange={setFilters} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(filters)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div id="guest-lectures">
            <ChartCard
              title="Guest Lectures Overview"
              description="Status distribution of guest lectures"
            >
              {guestLectureStats.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500">
                  No guest lectures scheduled yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={guestLectureStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                      label
                    >
                      {guestLectureStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry._id] || "#8b5cf6"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div id="remedial-classes">
            <ChartCard
              title="Remedial Classes Progress"
              description="Status distribution of remedial sessions"
            >
              {remedialStats.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500">
                  No remedial sessions scheduled yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={remedialStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                      label
                    >
                      {remedialStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry._id] || "#8884d8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
};
