import { useEffect, useState } from "react";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  DataTable,
  StatCard,
  ChartCard,
} from "@/components/common";
import { branchService } from "@/services/branchService";
import { campusService } from "@/services/campusService";
import { analyticsService } from "@/services/analyticsService";
import { academicConfigService } from "@/services/academicConfigService";
import { apiClient } from "@/services/apiClient";
import { getAllowedSemesters } from "@/utils/academicHistory";
import {
  ChevronRight,
  BookOpen,
  GraduationCap,
  Building2,
  Calendar,
  Users,
  AlertCircle,
  AlertTriangle,
  Percent,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const DrillDown = () => {
  const [level, setLevel] = useState(0);
  // Selections
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  // Data lists
  const [campuses, setCampuses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classMetrics, setClassMetrics] = useState(null);
  // Node Analytics map (caches metrics per node id so we show them before clicking next)
  const [metricsCache, setMetricsCache] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to fetch metrics
  const fetchMetrics = async (filters) => {
    try {
      const cohortFilters = { ...filters };
      if (cohortFilters.academicSemesterId)
        delete cohortFilters.academicSemesterId;
      if (cohortFilters.sectionId) delete cohortFilters.sectionId;

      const [kpis, backlogs, risk] = await Promise.all([
        analyticsService.getCampusKPIs(cohortFilters),
        analyticsService.getBacklogsDistribution(filters),
        analyticsService.getRiskDistribution(filters),
      ]);
      const mediumRisk = risk.find((r) => r.level === "MEDIUM")?.count || 0;
      const highRisk = risk.find((r) => r.level === "HIGH")?.count || 0;
      return {
        students: kpis.totalStudents,
        activeBacklogSubjects: backlogs.activeBacklogSubjects,
        atRisk: mediumRisk + highRisk,
      };
    } catch {
      return { students: 0, activeBacklogSubjects: 0, atRisk: 0 };
    }
  };

  // Level 0: Campuses
  useEffect(() => {
    const loadCampuses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await campusService.getAllCampuses();
        setCampuses(data);
        // Fetch metrics for all campuses
        const cache = {};
        for (const campus of data) {
          cache[campus._id] = await fetchMetrics({ campusId: campus._id });
        }
        setMetricsCache((prev) => ({ ...prev, ...cache }));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (level === 0 && campuses.length === 0) loadCampuses();
  }, [level]);

  // Level 1: Branches
  useEffect(() => {
    const loadBranches = async () => {
      if (!selectedCampus) return;
      setIsLoading(true);
      setError(null);
      try {
        const [allBranches, availabilities] = await Promise.all([
          branchService.getAllBranches(),
          branchService.getCampusBranchAvailability(),
        ]);
        const activeBranchIdsForCampus = availabilities
          .filter(
            (a) =>
              a.isAvailable &&
              (typeof a.campusId === "string"
                ? a.campusId === selectedCampus._id
                : a.campusId?._id === selectedCampus._id),
          )
          .map((a) =>
            typeof a.branchId === "string" ? a.branchId : a.branchId?._id,
          );

        const campusBranches = allBranches.filter((b) =>
          activeBranchIdsForCampus.includes(b._id),
        );
        setBranches(campusBranches);

        const branchPerformanceData =
          await analyticsService.getBranchesPerformance({
            campusId: selectedCampus._id,
          });
        const cache = {};
        for (const bp of branchPerformanceData) {
          cache[`${selectedCampus._id}-${bp._id}`] = {
            students: bp.students,
            activeBacklogSubjects: bp.activeBacklogs,
            atRisk: bp.atRisk,
          };
        }
        setMetricsCache((prev) => ({ ...prev, ...cache }));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (level === 1) loadBranches();
  }, [level, selectedCampus]);

  // Level 2: Years (2, 3, 4)
  useEffect(() => {
    const loadYears = async () => {
      if (!selectedBranch) return;
      setIsLoading(true);
      setError(null);
      try {
        const yearPerformanceData = await analyticsService.getYearsPerformance({
          campusId: selectedCampus._id,
          branchId: selectedBranch._id,
        });
        const cache = {};
        for (const yp of yearPerformanceData) {
          cache[`${selectedCampus._id}-${selectedBranch._id}-year-${yp._id}`] =
            {
              students: yp.students,
              activeBacklogSubjects: yp.activeBacklogs,
              atRisk: yp.atRisk,
            };
        }
        setMetricsCache((prev) => ({ ...prev, ...cache }));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (level === 2) loadYears();
  }, [level, selectedBranch]);

  // Level 3: Semesters
  useEffect(() => {
    const loadSemesters = async () => {
      if (!selectedYear) return;
      setIsLoading(true);
      setError(null);
      try {
        const sems = await academicConfigService.getAllSemesters();
        let cohortAcademicYearId = null;
        // Find the cohort's academic year ID by matching the name "Year " + selectedYear
        const matchingSem = sems.find(
          (sem) =>
            sem.academicYearId &&
            sem.academicYearId.academicYear === `Year ${selectedYear}`,
        );
        if (matchingSem && matchingSem.academicYearId) {
          cohortAcademicYearId =
            typeof matchingSem.academicYearId === "string"
              ? matchingSem.academicYearId
              : matchingSem.academicYearId._id;
        }

        const semMap = new Map();
        const allowedCodes = getAllowedSemesters(selectedYear);
        if (cohortAcademicYearId) {
          sems.forEach((s) => {
            const semAyId =
              typeof s.academicYearId === "string"
                ? s.academicYearId
                : s.academicYearId?._id;
            if (
              semAyId === cohortAcademicYearId &&
              allowedCodes.includes(s.semesterCode)
            ) {
              semMap.set(s._id, s);
            }
          });
        }
        const filteredSems = Array.from(semMap.values()).sort((a, b) =>
          a.semesterCode.localeCompare(b.semesterCode),
        );
        setSemesters(filteredSems);

        // Semester metrics are fetched on-demand when drill-down progresses, avoiding N+1 cascade.
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (level === 3) loadSemesters();
  }, [level, selectedYear]);

  // Level 4: Classes
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedSemester) return;
      setIsLoading(true);
      setError(null);
      try {
        const classMap = new Map();
        classMap.set("Class", { _id: "Class", name: "Class" });

        const classObjects = Array.from(classMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        setClasses(classObjects);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (level === 4) loadClasses();
  }, [level, selectedSemester]);

  // Level 5: Students & Analytics
  useEffect(() => {
    const loadClassAnalytics = async () => {
      if (!selectedClass) return;
      setIsLoading(true);
      setError(null);
      setStudents([]);
      setClassMetrics(null);
      try {
        // Fetch Students who actively participated in this historical semester
        let filtered = [];
        try {
          const res = await apiClient.get("/analytics/historical-students", {
            params: {
              campusId: selectedCampus._id,
              year: selectedYear,
              branchId: selectedBranch._id,
              academicSemesterId: selectedSemester._id,
            },
          });
          if (res.data) {
            filtered = res.data;
          }
        } catch (e) {
          console.error("Could not fetch historical students", e);
        }
        setStudents(filtered);

        const isUnassigned =
          selectedClass.name === "Class" &&
          typeof selectedClass._id === "string" &&
          selectedClass._id === "Class";

        // Fetch Analytics using exact academicSemesterId
        const filters = {
          campusId: selectedCampus._id,
          branchId: selectedBranch._id,
          year: selectedYear || undefined,
          academicSemesterId: selectedSemester._id,
        };
        if (!isUnassigned) {
          filters.sectionId = selectedClass._id;
        }
        const [kpis, results, backlogs, risk, trends] = await Promise.all([
          analyticsService.getCampusKPIs(filters),
          analyticsService.getResultsDistribution(filters),
          analyticsService.getBacklogsDistribution(filters),
          analyticsService.getRiskDistribution(filters),
          analyticsService.getAcademicTrends(filters),
        ]);

        // Use backend-enriched students directly
        setStudents(filtered);

        const mediumRisk = risk?.find((r) => r.level === "MEDIUM")?.count || 0;
        const highRisk = risk?.find((r) => r.level === "HIGH")?.count || 0;
        // For pie chart
        const riskChartData =
          risk
            ?.filter((r) => r.count > 0)
            .map((r) => ({ name: r.level, value: r.count })) || [];

        setClassMetrics({
          students: kpis?.totalStudents || filtered.length,
          activeBacklogSubjects: backlogs?.activeBacklogSubjects || 0,
          clearedBacklogs:
            (backlogs?.totalEver || 0) - (backlogs?.activeBacklogSubjects || 0),
          atRisk: mediumRisk + highRisk,
          passRate:
            results?.status !== "NOT_AVAILABLE" &&
            results?.status !== "HISTORICAL_NOT_IMPORTED" &&
            results?.status !== "NOT_ANNOUNCED" &&
            results?.kpis?.passRate !== undefined
              ? `${results.kpis.passRate.toFixed(1)}%`
              : null,
          avgMarks:
            trends?.kpis?.averageMarks !== undefined &&
            trends?.kpis?.averageMarks !== null
              ? `${trends.kpis.averageMarks.toFixed(1)}%`
              : null,
          riskDist: riskChartData,
          backlogStatus: [
            { name: "Active", value: backlogs?.activeBacklogSubjects || 0 },
            {
              name: "Cleared",
              value:
                (backlogs?.totalEver || 0) -
                (backlogs?.activeBacklogSubjects || 0),
            },
          ],
          academicPerformance: trends?.trends || [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (level === 5) loadClassAnalytics();
  }, [level, selectedClass]);

  const MetricsDisplay = ({ metrics }) => {
    if (!metrics)
      return (
        <div className="text-sm text-slate-400 mt-2">Loading metrics...</div>
      );
    return (
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-y-2 text-sm">
        <div className="flex items-center text-slate-600">
          <Users className="w-4 h-4 mr-2" />
          <span className="font-medium mr-1">Students:</span>{" "}
          {metrics.students || 0}
        </div>
        <div className="flex items-center text-slate-600">
          <BookOpen className="w-4 h-4 mr-2" />
          <span className="font-medium mr-1">
            Active Backlog Subjects:
          </span>{" "}
          {metrics.activeBacklogSubjects || 0}
        </div>
        <div className="flex items-center text-amber-600 col-span-2">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span className="font-medium mr-1">At-Risk:</span>{" "}
          {metrics.atRisk || 0}
        </div>
      </div>
    );
  };

  const Breadcrumbs = () => (
    <div className="flex items-center flex-wrap text-sm font-medium text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
      <button
        onClick={() => setLevel(0)}
        className={`hover:text-primary transition-colors ${level === 0 ? "text-primary" : ""}`}
      >
        Campuses
      </button>

      {level > 0 && selectedCampus && (
        <>
          <ChevronRight className="w-4 h-4 mx-2" />
          <button
            onClick={() => setLevel(1)}
            className={`hover:text-primary transition-colors ${level === 1 ? "text-primary" : ""}`}
          >
            {selectedCampus.name}
          </button>
        </>
      )}

      {level > 1 && selectedBranch && (
        <>
          <ChevronRight className="w-4 h-4 mx-2" />
          <button
            onClick={() => setLevel(2)}
            className={`hover:text-primary transition-colors ${level === 2 ? "text-primary" : ""}`}
          >
            {selectedBranch.name || selectedBranch.code}
          </button>
        </>
      )}

      {level > 2 && selectedYear && (
        <>
          <ChevronRight className="w-4 h-4 mx-2" />
          <button
            onClick={() => setLevel(3)}
            className={`hover:text-primary transition-colors ${level === 3 ? "text-primary" : ""}`}
          >
            Year {selectedYear}
          </button>
        </>
      )}

      {level > 3 && selectedSemester && (
        <>
          <ChevronRight className="w-4 h-4 mx-2" />
          <button
            onClick={() => setLevel(4)}
            className={`hover:text-primary transition-colors ${level === 4 ? "text-primary" : ""}`}
          >
            {selectedSemester.semesterCode}
          </button>
        </>
      )}

      {level > 4 && selectedClass && (
        <>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-primary">
            {selectedClass.name === "Class"
              ? "Class"
              : `Class ${selectedClass.name}`}
          </span>
        </>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Hierarchical Drill-Down"
        description="Navigate securely from campus level down to individual student rosters."
      />

      <Breadcrumbs />

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => setLevel(Math.max(0, level - 1))}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
          {/* Level 0: Campuses */}
          {level === 0 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Select Campus
              </h3>
              {campuses.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No campuses found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campuses.map((campus) => (
                    <button
                      key={campus._id}
                      onClick={() => {
                        setSelectedCampus(campus);
                        setLevel(1);
                      }}
                      className="text-left flex flex-col p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                        <h3 className="font-semibold text-lg text-slate-800">
                          {campus.name}
                        </h3>
                      </div>
                      <MetricsDisplay metrics={metricsCache[campus._id]} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Level 1: Branches */}
          {level === 1 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Branches in {selectedCampus?.name}
              </h3>
              {branches.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No branches found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {branches.map((branch) => (
                    <button
                      key={branch._id}
                      onClick={() => {
                        setSelectedBranch(branch);
                        setLevel(2);
                      }}
                      className="text-left flex flex-col p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                        <h3 className="font-semibold text-lg text-slate-800">
                          {branch.name} ({branch.code})
                        </h3>
                      </div>
                      <MetricsDisplay
                        metrics={
                          metricsCache[`${selectedCampus._id}-${branch._id}`]
                        }
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Level 2: Years */}
          {level === 2 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Years in {selectedBranch?.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[2, 3, 4].map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setLevel(3);
                    }}
                    className="text-left flex flex-col p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                      <h3 className="font-semibold text-lg text-slate-800">
                        Year {year}
                      </h3>
                    </div>
                    <MetricsDisplay
                      metrics={
                        metricsCache[
                          `${selectedCampus._id}-${selectedBranch._id}-year-${year}`
                        ]
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Level 3: Semesters */}
          {level === 3 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Semesters in Year {selectedYear}
              </h3>
              {semesters.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No semesters found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semesters.map((sem) => (
                    <button
                      key={sem._id}
                      onClick={() => {
                        setSelectedSemester(sem);
                        setLevel(4);
                      }}
                      className="text-left flex flex-col p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                        <h3 className="font-semibold text-lg text-slate-800">
                          Semester {sem.semesterCode}
                        </h3>
                      </div>
                      <MetricsDisplay
                        metrics={
                          metricsCache[
                            `${selectedCampus._id}-${selectedBranch._id}-${selectedYear}-${sem._id}`
                          ]
                        }
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Level 4: Classes */}
          {level === 4 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Classes in Semester {selectedSemester?.semesterCode}
              </h3>
              {classes.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No classes found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {classes.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => {
                        setSelectedClass(c);
                        setLevel(5);
                      }}
                      className="text-left flex flex-col p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                        <h3 className="font-semibold text-lg text-slate-800">
                          Class {c.name}
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Level 5: Students Analytics & Roster */}
          {level === 5 && classMetrics && (
            <div className="bg-slate-50 min-h-[600px]">
              {/* Context Header */}
              <div className="p-6 md:p-8 bg-white border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Class Academic Overview
                </h2>
                <p className="text-slate-500">
                  {selectedCampus?.name} / {selectedBranch?.name} / Year{" "}
                  {selectedYear} / Sem {selectedSemester?.semesterCode} / Class{" "}
                  {selectedClass?.name}
                </p>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Students"
                    value={classMetrics.students}
                    icon={Users}
                  />
                  <StatCard
                    title="Active Backlog Subjects"
                    value={classMetrics.activeBacklogSubjects}
                    icon={BookOpen}
                    contextLine={
                      classMetrics.activeBacklogSubjects > 0
                        ? "Requires Attention"
                        : "All Clear"
                    }
                    contextType={
                      classMetrics.activeBacklogSubjects === 0
                        ? "success"
                        : "warning"
                    }
                  />
                  <StatCard
                    title="At-Risk Students"
                    value={classMetrics.atRisk}
                    icon={AlertTriangle}
                    contextLine="Medium & High Risk"
                    contextType={
                      classMetrics.atRisk === 0 ? "success" : "danger"
                    }
                  />
                  {classMetrics.avgMarks ? (
                    <StatCard
                      title="Average Marks"
                      value={classMetrics.avgMarks}
                      icon={Percent}
                    />
                  ) : (
                    <StatCard
                      title="Average Marks"
                      value="N/A"
                      icon={Percent}
                      contextLine="No data"
                      contextType="neutral"
                    />
                  )}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart 1: Risk Distribution */}
                  <ChartCard
                    title="Risk Distribution"
                    description="Students categorized by risk level"
                  >
                    {classMetrics.riskDist &&
                    classMetrics.riskDist.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={classMetrics.riskDist}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {classMetrics.riskDist.map((entry, index) => {
                                const colors = {
                                  LOW: "#10b981",
                                  MEDIUM: "#f59e0b",
                                  HIGH: "#ef4444",
                                };
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={colors[entry.name] || "#94a3b8"}
                                  />
                                );
                              })}
                            </Pie>
                            <Tooltip
                              formatter={(val) => [val, "Students"]}
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
                    ) : (
                      <div className="flex h-[300px] flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                        <p>No risk data available.</p>
                      </div>
                    )}
                  </ChartCard>

                  {/* Chart 2: Active vs Cleared Backlogs */}
                  <ChartCard
                    title="Backlog Status"
                    description="Comparison of active vs cleared backlogs"
                  >
                    {classMetrics.activeBacklogSubjects > 0 ||
                    classMetrics.clearedBacklogs > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={classMetrics.backlogStatus}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: "#64748b" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fill: "#64748b" }}
                              axisLine={false}
                              tickLine={false}
                              allowDecimals={false}
                            />
                            <Tooltip
                              cursor={{ fill: "#f8fafc" }}
                              contentStyle={{
                                borderRadius: "8px",
                                border: "none",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {classMetrics.backlogStatus.map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      entry.name === "Active"
                                        ? "#ef4444"
                                        : "#10b981"
                                    }
                                  />
                                ),
                              )}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex h-[300px] flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                        <p>No backlogs recorded for this class.</p>
                      </div>
                    )}
                  </ChartCard>

                  {/* Chart 3: Academic Performance */}
                  <ChartCard
                    title="Academic Performance"
                    description="Internal assessment trends"
                  >
                    {classMetrics.academicPerformance &&
                    classMetrics.academicPerformance.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={classMetrics.academicPerformance}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: "#64748b" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fill: "#64748b" }}
                              axisLine={false}
                              tickLine={false}
                              domain={[0, 100]}
                            />
                            <Tooltip
                              formatter={(val) => [
                                `${Number(val).toFixed(1)}%`,
                                "Average Marks",
                              ]}
                              cursor={{ fill: "#f8fafc" }}
                              contentStyle={{
                                borderRadius: "8px",
                                border: "none",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                            />
                            <Bar
                              dataKey="averageMarks"
                              fill="#7C3AED"
                              radius={[4, 4, 0, 0]}
                              name="Average Marks"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex h-[300px] flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center px-4">
                        <Percent className="w-8 h-8 mb-2 opacity-50" />
                        <p>No academic marks available for this class yet.</p>
                      </div>
                    )}
                  </ChartCard>
                </div>

                {/* Student Roster */}
                <div className="bg-white rounded-xl shadow-xs border border-[#E5E0F5] overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Student Roster
                    </h3>
                    <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 rounded-full shadow-sm">
                      {students.length} Enrolled
                    </span>
                  </div>
                  <DataTable
                    data={students}
                    columns={[
                      { header: "#", cell: (_, i) => i + 1 },
                      {
                        header: "Student Name",
                        cell: (row) => (
                          <span className="font-medium text-slate-800">
                            {row.name || "-"}
                          </span>
                        ),
                      },
                      {
                        header: "Roll Number",
                        cell: (row) => row.rollNo || "-",
                      },
                      {
                        header: "Risk",
                        cell: (row) => {
                          const colors = {
                            LOW: "bg-emerald-100 text-emerald-700",
                            MEDIUM: "bg-amber-100 text-amber-700",
                            HIGH: "bg-red-100 text-red-700",
                          };
                          return (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[row.riskLevel] || "bg-slate-100 text-slate-600"}`}
                            >
                              {row.riskLevel || "LOW"}
                            </span>
                          );
                        },
                      },
                      {
                        header: "Active Backlog Count",
                        cell: (row) => (
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${row.activeBacklogs > 0 ? "bg-amber-500" : "bg-emerald-500"}`}
                            />
                            <span
                              className={
                                row.activeBacklogs > 0
                                  ? "font-medium text-slate-700"
                                  : "text-slate-500"
                              }
                            >
                              {row.activeBacklogs || 0}
                            </span>
                          </div>
                        ),
                      },
                      {
                        header: "Branch",
                        cell: (row) =>
                          typeof row.branchId === "object"
                            ? row.branchId?.code
                            : selectedBranch?.code,
                      },
                    ]}
                    emptyMessage={`No students found in Class ${selectedClass?.name}.`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
