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
    const sem = b.academicSemesterId?.semesterCode || "Unknown";
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
      cell: (row) => row.academicSemesterId?.semesterCode || "Unknown",
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <Card className="shadow-xs border border-[#7DA0CA]/35 rounded-xl bg-white">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <span className="text-[#5483B3] text-xs font-bold uppercase tracking-wider mb-2">
                  Total Backlog History
                </span>
                <span className="text-3xl font-extrabold text-[#021024]">
                  {backlogs.length}
                </span>
              </CardContent>
            </Card>
            <Card className="shadow-xs border border-[#7DA0CA]/35 rounded-xl bg-white">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <span className="text-[#5483B3] text-xs font-bold uppercase tracking-wider mb-2">
                  Cleared Subjects
                </span>
                <span className="text-3xl font-extrabold text-emerald-600">
                  {clearedBacklogs.length}
                </span>
              </CardContent>
            </Card>
            <Card className="shadow-xs border border-[#7DA0CA]/35 rounded-xl bg-white">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                <span className="text-[#5483B3] text-xs font-bold uppercase tracking-wider mb-2">
                  Remaining Active Backlogs
                </span>
                <span className="text-3xl font-extrabold text-rose-600">
                  {activeBacklogs.length}
                </span>
              </CardContent>
            </Card>
            <Card className={`shadow-xs rounded-xl border ${riskColor}`}>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                    Academic Risk
                  </span>
                </div>
                <div className="text-3xl font-extrabold">{riskLevel}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          {backlogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xs border border-[#7DA0CA]/35 rounded-xl bg-white">
                <CardHeader className="border-b border-[#7DA0CA]/20 bg-[#f4f9fd]/50 pb-3">
                  <CardTitle className="text-[#021024] text-sm font-bold">
                    Active vs Cleared
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
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

              <Card className="shadow-xs border border-[#7DA0CA]/35 rounded-xl bg-white">
                <CardHeader className="border-b border-[#7DA0CA]/20 bg-[#f4f9fd]/50 pb-3">
                  <CardTitle className="text-[#021024] text-sm font-bold">
                    Backlogs by Semester
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <defs>
                          <linearGradient id="backlogSemGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0090FF" />
                            <stop offset="100%" stopColor="#052659" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="semester"
                          tick={{ fontSize: 12, fill: "#5483B3" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: "#5483B3" }}
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
                          fill="url(#backlogSemGrad)"
                          radius={[6, 6, 0, 0]}
                          barSize={36}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-xs border border-[#7DA0CA]/35 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-[#7DA0CA]/20 bg-[#f4f9fd]/50">
              <h3 className="font-bold text-sm text-[#021024]">Backlog Records</h3>
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
