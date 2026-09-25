import { useEffect, useState } from "react";
import { PageHeader, LoadingSkeleton, ErrorState } from "@/components/common";
import { apiClient } from "@/services/apiClient";
import { branchService } from "@/services/branchService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, FileText, Trash2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [noticeType, setNoticeType] = useState("ACADEMIC_NOTICE");
  const [description, setDescription] = useState("");
  const [targetBranches, setTargetBranches] = useState([]);
  const [targetYears, setTargetYears] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [noticesRes, branchesData] = await Promise.all([
        apiClient.get("/notifications/notices"),
        branchService.getAllBranches(),
      ]);
      setNotices(noticesRes.data.data || noticesRes.data);
      setBranches(branchesData);
    } catch (err) {
      setError(err.message || "Failed to load notices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setUploadMessage({
          type: "error",
          text: "Only PDF files are allowed.",
        });
        setFile(null);
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      setUploadMessage(null);
    }
  };

  const handleBranchToggle = (branchId) => {
    setTargetBranches((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId],
    );
  };

  const handleYearToggle = (year) => {
    setTargetYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  const handleUpload = async () => {
    if (!file || !title || !noticeType) {
      setUploadMessage({
        type: "error",
        text: "Please fill all required fields and select a PDF.",
      });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("title", title);
      formData.append("noticeType", noticeType);
      if (description) formData.append("description", description);
      formData.append("targetBranches", JSON.stringify(targetBranches));
      formData.append("targetYears", JSON.stringify(targetYears));

      await apiClient.post("/notifications/notices", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMessage({
        type: "success",
        text: "Notice uploaded successfully. You can now publish it.",
      });
      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setTargetBranches([]);
      setTargetYears([]);
      const fileInput = document.getElementById("pdf-upload");
      if (fileInput) fileInput.value = "";
      await loadData();
    } catch (err) {
      setUploadMessage({
        type: "error",
        text: err.message || "Failed to upload notice",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const estimateRes = await apiClient.put(
        `/notifications/notices/${id}/publish?estimate=true`,
      );
      const count = estimateRes.data?.estimatedCount || 0;
      if (
        !window.confirm(
          `Target Audience: Selected Branches & Years\nEstimated Student Count: ${count}\n\nAre you sure you want to publish this notice?`,
        )
      )
        return;
      const publishRes = await apiClient.put(
        `/notifications/notices/${id}/publish`,
      );
      const stats = publishRes.data?.stats;
      alert(
        `Notice published successfully!\n\nTargeted: ${stats?.targeted || 0}\nCreated: ${stats?.created || 0}\nDuplicates Skipped: ${stats?.duplicatesSkipped || 0}`,
      );
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to publish");
    }
  };

  const handleUnpublish = async (id) => {
    if (!window.confirm("Are you sure you want to unpublish this notice?"))
      return;
    try {
      await apiClient.put(`/notifications/notices/${id}/unpublish`);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to unpublish");
    }
  };

  const handleViewStats = async (id) => {
    try {
      const stats = await apiClient.get(`/notifications/notices/${id}/stats`);
      const data = stats.data;
      alert(
        `Acknowledgement Status:\n\nTotal Targeted: ${data.totalTargeted}\nViewed: ${data.viewed}\nNot Viewed: ${data.notViewed}\nView Percentage: ${data.viewPercentage}%`,
      );
    } catch (err) {
      alert(err.message || "Failed to fetch stats");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await apiClient.delete(`/notifications/notices/${id}`);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to delete");
    }
  };

  const handleViewPdf = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const response = await fetch(
        `${baseUrl}/notifications/notices/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      window.open(url, "_blank");
    } catch {
      alert("Failed to open PDF document.");
    }
  };

  if (isLoading && notices.length === 0) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Notices & Timetables"
        description="Upload and broadcast official PDF documents across multiple branches and years."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" />
            Upload Document
          </h3>

          {uploadMessage && (
            <div
              className={`p-3 rounded-md mb-4 text-sm ${uploadMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}
            >
              {uploadMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Exam Timetable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Document Type *
              </label>
              <Select value={noticeType} onValueChange={setNoticeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mid-1 Notification">
                    Mid-1 Notification
                  </SelectItem>
                  <SelectItem value="Mid-1 Timetable">
                    Mid-1 Timetable
                  </SelectItem>
                  <SelectItem value="Mid-2 Notification">
                    Mid-2 Notification
                  </SelectItem>
                  <SelectItem value="Mid-2 Timetable">
                    Mid-2 Timetable
                  </SelectItem>
                  <SelectItem value="Class Timetable">
                    Class Timetable
                  </SelectItem>
                  <SelectItem value="Semester Timetable">
                    Semester Timetable
                  </SelectItem>
                  <SelectItem value="Semester Examination Timetable">
                    Semester Examination Timetable
                  </SelectItem>
                  <SelectItem value="Other Academic Notification">
                    Other Academic Notification
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description (Optional)
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief context..."
              />
            </div>

            {/* Admin Targeting UI */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Branches (Empty = All)
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {branches.map((b) => (
                  <label
                    key={b._id}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={targetBranches.includes(b._id)}
                      onChange={() => handleBranchToggle(b._id)}
                    />

                    <span>{b.code}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Years (Empty = All)
              </label>
              <div className="flex flex-wrap gap-4 mb-4">
                {[1, 2, 3, 4].map((y) => (
                  <label
                    key={y}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={targetYears.includes(y)}
                      onChange={() => handleYearToggle(y)}
                    />

                    <span>Year {y}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                PDF File *
              </label>
              <Input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer file:text-primary file:font-medium file:bg-primary/10 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-md hover:file:bg-primary/20"
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={isUploading || !file || !title}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload Notice"}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Global Documents
          </h3>

          {error && <ErrorState message={error} onRetry={loadData} />}

          {notices.length === 0 && !error ? (
            <div className="bg-white p-8 text-center rounded-xl shadow-sm border border-slate-200 text-slate-500">
              No notices uploaded yet.
            </div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice._id}
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-800">
                      {notice.title}
                    </h4>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-slate-100 text-slate-700"
                    >
                      {notice.noticeType}
                    </Badge>
                    {notice.isPublished ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2"
                      >
                        Published
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 ml-2"
                      >
                        Draft
                      </Badge>
                    )}
                  </div>
                  {notice.description && (
                    <p className="text-sm text-slate-600 mb-2">
                      {notice.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mb-2">
                    Targets:{" "}
                    {notice.targetBranches?.length
                      ? notice.targetBranches.length + " Branches"
                      : "All Branches"}{" "}
                    |{" "}
                    {notice.targetYears?.length
                      ? "Years: " + notice.targetYears.join(", ")
                      : "All Years"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Uploaded: {new Date(notice.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPdf(notice._id)}
                  >
                    View PDF
                  </Button>

                  {!notice.isPublished ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handlePublish(notice._id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publish
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStats(notice._id)}
                      >
                        Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnpublish(notice._id)}
                      >
                        Unpublish
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notice._id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
