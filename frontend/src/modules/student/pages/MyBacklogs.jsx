import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
  StatusBadge,
} from "@/components/common";
import { resultService } from "@/services/resultService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AlertTriangle } from "lucide-react";

export const MyBacklogs = () => {
  const [backlogs, setBacklogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resultService.getMyBacklogs();
      setBacklogs(data || []);
    } catch (err) {
      setError(err.message || "Failed to load backlogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeBacklogs = backlogs.filter((b) => b.status === "ACTIVE");
  const clearedBacklogs = backlogs.filter((b) => b.status === "CLEARED");
  let riskLevel = "LOW";
  let riskColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (activeBacklogs.length >= 5) {
    riskLevel = "HIGH";
    riskColor = "text-rose-700 bg-rose-50 border-rose-200";
  } else if (activeBacklogs.length >= 2) {
    riskLevel = "MEDIUM";
    riskColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  const chartData = [
    { name: "Active", value: activeBacklogs.length, color: "#f43f5e" },
    { name: "Cleared", value: clearedBacklogs.length, color: "#10b981" },
  ].filter((d) => d.value > 0);

  // Calculate Backlogs by Semester chart data
  const semesterCount = {};
  backlogs.forEach((b) => {
    const sem = b.semesterId?.semesterCode || "Unknown";
    semesterCount[sem] = (semesterCount[sem] || 0) + 1;
  });
  const barChartData = Object.keys(semesterCount)
    .sort()
    .map((sem) => ({
      semester: sem,
      count: semesterCount[sem],
    }));

  const columns = [
    { header: "Subject", cell: (row) => row.subjectId?.subjectName || "-" },
    {
      header: "Semester",
      cell: (row) => row.academicSemesterId?.semesterCode || "-",
    },
    {
      header: "Status",
      cell: (row) => (
        <StatusBadge
          status={row.status === "ACTIVE" ? "danger" : "success"}
          label={row.status}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Backlogs"
        description="Track your active backlog subjects, cleared subjects, and academic risk status."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          {/* Three Summary Cards + Risk Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">
                  Total Backlog History
                </span>
                <span className="text-4xl font-bold text-slate-800">
                  {backlogs.length}
                </span>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">
                  Cleared Subjects
                </span>
                <span className="text-4xl font-bold text-emerald-600">
                  {clearedBacklogs.length}
                </span>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">
                  Remaining Active Backlogs
                </span>
                <span className="text-4xl font-bold text-rose-600">
                  {activeBacklogs.length}
                </span>
              </CardContent>
            </Card>
            <Card className={`shadow-sm border ${riskColor}`}>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-wider opacity-80">
                    Academic Risk
                  </span>
                </div>
                <div className="text-3xl font-bold">{riskLevel}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          {backlogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-800 text-base">
                    Active vs Cleared
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-800 text-base">
                    Backlogs by Semester
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="semester"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#7C3AED"
                          radius={[4, 4, 0, 0]}
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-xs border border-[#E5E0F5] overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-[#E5E0F5] bg-[#F5F3FF]">
              <h3 className="font-semibold text-[#1F1B2D]">Backlog Records</h3>
            </div>
            <DataTable
              data={backlogs}
              columns={columns}
              emptyMessage="Great job! You have no backlog records."
            />
          </div>
        </>
      )}
    </div>
  );
};
