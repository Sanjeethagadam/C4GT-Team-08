import { useEffect, useState, useMemo } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
} from "@/components/common";
import { examinationService } from "@/services/examinationService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const MyMarks = () => {
  const [marks, setMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await examinationService.getMyMarks();
      setMarks(data || []);
    } catch (err) {
      setError(err.message || "Failed to load marks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = useMemo(() => {
    if (!marks || marks.length === 0) return [];
    const subjectMap = {};
    marks.forEach((m) => {
      const subName = m.subjectId?.subjectName || "Unknown Subject";
      const examType = (
        m.examinationId?.type ||
        m.examinationId?.examType ||
        ""
      ).toUpperCase();
      if (!subjectMap[subName]) {
        subjectMap[subName] = {
          subject:
            subName.substring(0, 15) + (subName.length > 15 ? "..." : ""),
          fullSubject: subName,
        };
      }
      if (
        examType.includes("MID-1") ||
        examType === "MID 1" ||
        examType === "MID_1"
      ) {
        subjectMap[subName]["Mid 1"] = m.marksObtained || 0;
      } else if (
        examType.includes("MID-2") ||
        examType === "MID 2" ||
        examType === "MID_2"
      ) {
        subjectMap[subName]["Mid 2"] = m.marksObtained || 0;
      }
    });
    return Object.values(subjectMap);
  }, [marks]);

  const mid1Avg = useMemo(() => {
    const mid1Marks = marks.filter((m) => {
      const et =
        (m.examinationId?.type || m.examinationId?.examType)?.toUpperCase() ||
        "";
      return (
        (et.includes("MID-1") || et === "MID 1" || et === "MID_1") &&
        m.status === "ATTENDED"
      );
    });
    if (mid1Marks.length === 0) return "Not Available";
    const total = mid1Marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
    return (total / mid1Marks.length).toFixed(1);
  }, [marks]);

  const mid2Avg = useMemo(() => {
    const mid2Marks = marks.filter((m) => {
      const et =
        (m.examinationId?.type || m.examinationId?.examType)?.toUpperCase() ||
        "";
      return (
        (et.includes("MID-2") || et === "MID 2" || et === "MID_2") &&
        m.status === "ATTENDED"
      );
    });
    if (mid2Marks.length === 0) return "Not Available";
    const total = mid2Marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
    return (total / mid2Marks.length).toFixed(1);
  }, [marks]);

  const columns = [
    { header: "Subject", cell: (row) => row.subjectId?.subjectName || "-" },
    {
      header: "Exam Type",
      cell: (row) =>
        row.examinationId?.type || row.examinationId?.examType || "-",
    },
    {
      header: "Status",
      cell: (row) =>
        row.status === "ATTENDED"
          ? "Present"
          : row.status === "ABSENT"
            ? "Absent"
            : row.status === "MALPRACTICE"
              ? "Missing Paper"
              : row.status || "-",
    },
    {
      header: "Marks Obtained",
      cell: (row) =>
        row.status === "ATTENDED"
          ? `${row.marksObtained} / ${(row.examinationId?.type || row.examinationId?.examType)?.includes("MID") ? 30 : row.maxMarks}`
          : "-",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Internal Marks"
        description="View your performance in internal examinations (Mid-1, Mid-2, etc.). Note: These are internal metrics only."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : marks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#f0fdf4] border border-emerald-200/80 shadow-xs rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-900 text-base font-bold">
                  Mid-1 Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mid1Avg === "Not Available" ? (
                  <div className="text-sm font-semibold text-emerald-700">
                    Not Available
                  </div>
                ) : (
                  <div className="text-3xl font-extrabold text-emerald-950">
                    {mid1Avg}{" "}
                    <span className="text-xs font-semibold text-emerald-700">
                      / 30
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-[#f4f9fd] border border-[#7DA0CA]/40 shadow-xs rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#052659] text-base font-bold">
                  Mid-2 Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mid2Avg === "Not Available" ? (
                  <div className="text-sm font-semibold text-[#5483B3]">
                    Not Available
                  </div>
                ) : (
                  <div className="text-3xl font-extrabold text-[#021024]">
                    {mid2Avg}{" "}
                    <span className="text-xs font-semibold text-[#5483B3]">
                      / 30
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 && (
            <Card className="shadow-xs border border-[#7DA0CA]/35 rounded-xl bg-white">
              <CardHeader className="border-b border-[#7DA0CA]/20 bg-[#f4f9fd]/50 pb-3">
                <CardTitle className="text-[#021024] text-sm font-bold">
                  Mid-1 vs Mid-2 Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="mid1Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0090FF" />
                          <stop offset="100%" stopColor="#052659" />
                        </linearGradient>
                        <linearGradient id="mid2Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="subject"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#5483B3" }}
                      />
                      <YAxis
                        domain={[0, 30]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#5483B3" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        cursor={{ fill: "#f8fafc" }}
                      />

                      <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "20px" }}
                      />
                      <Bar
                        dataKey="Mid 1"
                        fill="url(#mid1Grad)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                      <Bar
                        dataKey="Mid 2"
                        fill="url(#mid2Grad)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-white rounded-xl shadow-xs border border-[#7DA0CA]/35 overflow-hidden mt-6">
            <DataTable
              data={marks}
              columns={columns}
              emptyMessage="No marks have been published yet."
            />
          </div>
        </>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-1">
            No Marks Available
          </h3>
          <p className="text-slate-500">
            Your internal marks have not been published yet.
          </p>
        </div>
      )}
    </div>
  );
};
