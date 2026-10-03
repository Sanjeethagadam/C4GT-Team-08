import { useEffect, useState, useMemo } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
  ChartCard,
} from "@/components/common";
import { ctpoService } from "@/services/ctpoService";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const getRiskColor = (risk) => {
  switch (risk) {
    case "LOW":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "AT-RISK":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

const RISK_COLORS = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
};

export const Backlogs = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resData = await ctpoService.getStudentsList({ backlog: "WITH" });
      setStudents(resData);
    } catch (err) {
      setError(err.message || "Failed to load class backlogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregations for charts
  const { semesterData, subjectData, riskData } = useMemo(() => {
    const semMap = {};
    const subMap = {};
    const riskMap = { LOW: 0, MEDIUM: 0, HIGH: 0 };

    students.forEach((s) => {
      // Risk distribution
      if (riskMap[s.riskLevel] !== undefined) riskMap[s.riskLevel]++;

      // Semester & Subject backlogs
      s.backlogDetails?.forEach((b) => {
        semMap[b.semesterCode] = (semMap[b.semesterCode] || 0) + 1;
        subMap[b.subjectName] = (subMap[b.subjectName] || 0) + 1;
      });
    });

    const sData = Object.keys(semMap)
      .sort()
      .map((k) => ({ name: k, count: semMap[k] }));

    const subData = Object.keys(subMap)
      .sort((a, b) => subMap[b] - subMap[a])
      .slice(0, 10) // Top 10 subjects
      .map((k) => ({ name: k, count: subMap[k] }));

    const rData = Object.keys(riskMap)
      .filter((k) => riskMap[k] > 0)
      .map((k) => ({ name: k, count: riskMap[k] }));

    return { semesterData: sData, subjectData: subData, riskData: rData };
  }, [students]);

  const columns = [
    { header: "Roll No", cell: (row) => row.rollNo || "-" },
    { header: "Name", cell: (row) => row.name || "-" },
    {
      header: "Active Backlogs",
      cell: (row) => (
        <span className="font-semibold text-amber-600">
          {row.activeBacklogCount}
        </span>
      ),
    },
    {
      header: "Risk Level",
      cell: (row) => (
        <Badge
          variant="outline"
          className={`font-medium ${getRiskColor(row.riskLevel)}`}
        >
          {row.riskLevel}
        </Badge>
      ),
    },
    {
      header: "Subjects (Semesters)",
      cell: (row) => (
        <div className="flex flex-col gap-1 text-sm">
          {row.backlogDetails?.map((b, i) => (
            <span key={i} className="text-slate-600">
              • {b.subjectName}{" "}
              <span className="text-slate-400">({b.semesterCode})</span>
            </span>
          ))}
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Backlogs"
        description="Students in your assigned class with one or more active backlogs."
      />

      {students.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartCard title="Backlogs by Semester">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={semesterData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ctpoSemBacklogGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0090FF" />
                    <stop offset="100%" stopColor="#052659" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#ctpoSemBacklogGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Subjects by Backlogs">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={subjectData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ctpoSubjBacklogGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#052659" />
                    <stop offset="100%" stopColor="#0090FF" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#ctpoSubjBacklogGrad)"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Risk Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {riskData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={RISK_COLORS[entry.name] || "#94a3b8"}
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
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <DataTable
          columns={columns}
          data={students}
          emptyMessage="No active backlogs found in this class."
        />
      </div>
    </div>
  );
};
