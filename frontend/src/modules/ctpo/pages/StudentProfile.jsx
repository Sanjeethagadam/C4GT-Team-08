import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PageHeader,
  LoadingSkeleton,
  ErrorState,
  ExportButton,
} from "@/components/common";
import { ctpoService } from "@/services/ctpoService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  BookOpen,
  AlertTriangle,
  Calendar,
  MapPin,
  CheckCircle,
  Bell,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateGPA } from "@/utils/gpaUtils";

const getRiskColor = (risk) => {
  switch (risk) {
    case "LOW":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "HIGH":
      return "bg-red-100 text-red-800 border-red-200";
    case "AT-RISK":
      return "bg-red-600 text-white border-red-700";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

export const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await ctpoService.getStudentProfile(id);
      setData(response);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load student profile",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" />
        <LoadingSkeleton type="table" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/ctpo/students")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
        </Button>
        <ErrorState message={error || "Student not found"} onRetry={loadData} />
      </div>
    );
  }

  const { student, activeBacklogs } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/ctpo/students")}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <PageHeader
            title="Student Profile"
            description={`Comprehensive view for ${student.name} (${student.rollNo})`}
          />
        </div>
        <ExportButton
          endpoint={`profile/${student._id}`}
          filename={`${student.rollNo}_Profile`}
          title={`Academic Profile: ${student.name}`}
        />
      </div>

      {/* Primary Identity Section */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {student.name}
              </h2>
              <div className="text-slate-500 font-medium text-sm mt-1 flex items-center gap-2">
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs">
                  {student.rollNo}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">
              Risk Assessment
            </div>
            <Badge
              variant="outline"
              className={`text-sm px-4 py-1 uppercase tracking-wider ${getRiskColor(student.riskLevel)}`}
            >
              {student.riskLevel} RISK
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1 font-medium">
                <BookOpen className="w-4 h-4" /> Branch
              </div>
              <div className="font-semibold text-slate-800">
                {student.branch?.code || student.branch}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1 font-medium">
                <Calendar className="w-4 h-4" /> Academic Year
              </div>
              <div className="font-semibold text-slate-800">
                Year {student.year}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1 font-medium">
                <MapPin className="w-4 h-4" /> Current Semester
              </div>
              <div className="font-semibold text-slate-800">
                {student.currentSemester || "N/A"}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1 font-medium">
                <AlertTriangle className="w-4 h-4" /> Active Backlog Count
              </div>
              <div
                className={`font-semibold text-lg ${student.activeBacklogsCount > 0 ? "text-amber-600" : "text-emerald-600"}`}
              >
                {student.activeBacklogsCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="bg-slate-100 p-1 mb-6">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="marks"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Marks & Results
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Activity History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          {/* Active Backlogs Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Active Backlog Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activeBacklogs.length === 0 ? (
                <div className="p-8 text-center text-emerald-600 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <User className="w-6 h-6" />
                  </div>
                  <p className="font-medium">
                    This student has no active backlogs.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="w-24 text-center">
                        Semester
                      </TableHead>
                      <TableHead>Subject Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBacklogs.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-center font-medium">
                          <Badge variant="outline" className="bg-slate-100">
                            {b.semester}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">
                          {b.subjectName}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marks" className="space-y-6 mt-0">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg text-slate-800">
                Internal Marks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.marks?.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No internal marks recorded.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">Marks</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.marks?.map((m) => (
                      <TableRow key={m._id}>
                        <TableCell className="font-medium">
                          {m.examName}
                        </TableCell>
                        <TableCell>{m.subjectName}</TableCell>
                        <TableCell className="text-center">
                          {m.marksObtained} / {m.maxMarks}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              m.status === "PRESENT"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }
                          >
                            {m.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg text-slate-800">
                Semester Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.semesterResults?.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No official university result data available for this
                  semester.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="w-24 text-center">
                        Semester
                      </TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Grade Point</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.semesterResults?.map((sr) => (
                      <TableRow key={sr._id}>
                        <TableCell className="text-center">
                          <Badge variant="outline">{sr.semester}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {sr.subjectName}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {sr.grade || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {sr.gradePoint !== undefined ? sr.gradePoint : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {sr.credits !== undefined ? sr.credits : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-bold ${sr.passed ? "text-emerald-600" : sr.result === "F" ? "text-red-600" : "text-slate-600"}`}
                          >
                            {sr.result}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* GPA Summary Card */}
          {data.semesterResults && data.semesterResults.length > 0 && (
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden p-6 mt-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Academic Summary
              </h3>
              {(() => {
                const gpaData = calculateGPA(data.semesterResults);
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
                        Total Credits
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {gpaData.credits}
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
                        Total Points
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {gpaData.points}
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-emerald-500/30">
                      <div className="text-emerald-400 text-sm font-medium uppercase tracking-wider mb-1">
                        Overall CGPA
                      </div>
                      <div className="text-3xl font-bold text-emerald-400">
                        {gpaData.gpa}
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-blue-500/30">
                      <div className="text-blue-400 text-sm font-medium uppercase tracking-wider mb-1">
                        Percentage
                      </div>
                      <div className="text-3xl font-bold text-blue-400">
                        {gpaData.percentage}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg text-slate-800">
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {data.history?.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No historical activity found.
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {data.history?.map((event) => (
                    <div
                      key={event.id}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {event.type === "BACKLOG" && (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                        {event.type === "MARKS" && (
                          <BookOpen className="w-4 h-4 text-blue-500" />
                        )}
                        {event.type === "SEMESTER_RESULT" && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                        {event.type === "NOTIFICATION" && (
                          <Bell className="w-4 h-4 text-[#7C3AED]" />
                        )}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-800 text-sm">
                            {event.title}
                          </div>
                          <time className="text-xs text-slate-500">
                            {new Date(event.date).toLocaleDateString()}
                          </time>
                        </div>
                        <div className="text-slate-600 text-sm">
                          {event.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
