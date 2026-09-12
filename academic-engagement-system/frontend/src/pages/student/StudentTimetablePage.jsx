import React, { useState, useEffect } from "react";
import {
  getStudentTimetables,
  getTimetableFileUrl,
  getTimetableDownloadUrl,
} from "../../api/timetables.api";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import {
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  X,
  RefreshCw,
  AlertCircle,
  Building2,
} from "lucide-react";

export default function StudentTimetablePage() {
  const [timetables, setTimetables] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL"); // 'ALL', 'MID', 'SEMESTER'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preview Modal State
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudentTimetables();
      const list =
        res.data?.timetables ||
        (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
      setTimetables(list);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to retrieve published timetables");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = (item) => {
    setSelectedTimetable(item);
    setDocLoading(true);
    setDocError(false);
    setRetryKey((prev) => prev + 1);

    // Timeout safety so loading spinner clears when PDF loads inside embed/iframe
    setTimeout(() => {
      setDocLoading(false);
    }, 1200);
  };

  const handleClosePreview = () => {
    setSelectedTimetable(null);
    setDocLoading(false);
    setDocError(false);
  };

  const handleRetryDoc = () => {
    setDocLoading(true);
    setDocError(false);
    setRetryKey((prev) => prev + 1);
    setTimeout(() => {
      setDocLoading(false);
    }, 1200);
  };

  const isPdfItem = (item) => {
    if (!item) return false;
    if (item.fileType === "pdf") return true;
    if (item.file?.mimeType?.toLowerCase().includes("pdf")) return true;
    const url = item.fileUrl || item.file?.filename || item.fileName || "";
    return url.toLowerCase().endsWith(".pdf");
  };

  const resolveFileUrl = (item) => {
    if (!item) return "#";
    // Prefer authenticated download endpoint with token if ID is available
    if (item._id) {
      return getTimetableDownloadUrl(item._id);
    }
    return getTimetableFileUrl(item.fileUrl, item._id);
  };

  const filteredTimetables = activeTab === "ALL"
    ? timetables
    : timetables.filter((t) => t.timetableType === activeTab);

  const midCount = timetables.filter((t) => t.timetableType === "MID").length;
  const semesterCount = timetables.filter((t) => t.timetableType === "SEMESTER").length;

  if (loading) {
    return <LoadingState message="Loading timetable schedules from database..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchTimetables} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            Academic Timetables
          </h1>
          <p className="text-sm sm:text-[15px] text-slate-500 mt-1">
            Official schedules published strictly for your branch and semester
          </p>
        </div>

        {/* Filter Tabs */}
        {timetables.length > 0 && (
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-academic-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({timetables.length})
            </button>
            <button
              onClick={() => setActiveTab("MID")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
                activeTab === "MID"
                  ? "bg-academic-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Mid Exams ({midCount})
            </button>
            <button
              onClick={() => setActiveTab("SEMESTER")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
                activeTab === "SEMESTER"
                  ? "bg-academic-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semester Classwork ({semesterCount})
            </button>
          </div>
        )}
      </div>

      {/* Grid of Timetable Cards or Empty State */}
      {filteredTimetables.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No timetable scheduled yet."
          description="Your timetable will appear here as soon as it is uploaded by your CTPO."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTimetables.map((item) => {
            const isPdf = isPdfItem(item);
            const semCode =
              item.semesterId?.semesterCode ||
              (item.semesterId?.semesterNumber
                ? `Semester ${item.semesterId.semesterNumber}`
                : "Year 4");
            const title =
              item.timetableType === "MID"
                ? `${item.midExam || "MID-1"} Examination Schedule`
                : "Semester Classwork Schedule";
            const uploadDate = item.uploadedAt || item.createdAt;

            return (
              <div
                key={item._id}
                className="academic-card p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        isPdf
                          ? "bg-rose-50 border-rose-100 text-rose-600"
                          : "bg-sky-50 border-sky-100 text-sky-600"
                      }`}
                    >
                      {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>
                    <Badge variant={item.timetableType === "MID" ? "academic" : "purple"} size="sm">
                      {item.timetableType === "MID" ? (item.midExam || "MID-1") : "SEMESTER"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-academic-800 transition-colors">
                      {title}
                    </h3>
                    <p className="text-[13px] sm:text-sm text-slate-500 mt-1">
                      {semCode} &bull; Year {item.year || 4}
                    </p>
                  </div>

                  <div className="text-xs sm:text-[13px] text-slate-500 space-y-1 pt-1.5 border-t border-slate-100">
                    <p>
                      Document:{" "}
                      <span className="font-semibold text-slate-700 truncate">
                        {item.fileName || item.file?.originalName || "Schedule"}
                      </span>
                    </p>
                    <p>
                      Uploaded:{" "}
                      <span className="text-slate-600">
                        {uploadDate ? new Date(uploadDate).toLocaleDateString() : "Current"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenPreview(item)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-academic-800 hover:bg-academic-900 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Schedule</span>
                  </button>

                  <a
                    href={getTimetableDownloadUrl(item._id)}
                    download
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Download document"
                  >
                    <Download className="w-4.5 h-4.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Critical Timetable Document Preview Modal */}
      {selectedTimetable && (() => {
        const item = selectedTimetable;
        const fileUrl = resolveFileUrl(item);
        const downloadUrl = getTimetableDownloadUrl(item._id);
        const isPdf = isPdfItem(item);
        const semCode =
          item.semesterId?.semesterCode ||
          (item.semesterId?.semesterNumber
            ? `Semester ${item.semesterId.semesterNumber}`
            : "Year 4");
        const modalTitle =
          item.timetableType === "MID"
            ? `${item.midExam || "MID-1"} Examination Schedule`
            : "Semester Classwork Schedule";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isPdf
                        ? "bg-rose-50 border border-rose-100 text-rose-600"
                        : "bg-sky-50 border border-sky-100 text-sky-600"
                    }`}
                  >
                    {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{modalTitle}</h3>
                      <Badge variant={item.timetableType === "MID" ? "academic" : "purple"} size="sm">
                        {item.timetableType === "MID" ? (item.midExam || "MID-1") : "SEMESTER"}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
                      {semCode} &bull; Branch: {item.branchId?.code || "Branch"} &bull; Published:{" "}
                      {item.uploadedAt
                        ? new Date(item.uploadedAt).toLocaleDateString()
                        : "Current"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 text-sm font-semibold text-academic-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Open Full Screen</span>
                  </a>
                  <a
                    href={downloadUrl}
                    download
                    className="px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  <button
                    onClick={handleClosePreview}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Document Viewing Area */}
              <div className="flex-1 bg-slate-100/80 p-3 sm:p-4 overflow-auto flex items-center justify-center relative">
                {docLoading && !docError && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-xs">
                    <LoadingState message="Loading timetable document..." />
                  </div>
                )}

                {docError ? (
                  <div className="text-center p-8 bg-white rounded-2xl border border-rose-200 max-w-md shadow-card space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Unable to load timetable document.
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      The document preview could not be displayed directly. You can retry loading or open the document in a new window.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={handleRetryDoc}
                        className="px-4 py-2 bg-academic-800 hover:bg-academic-900 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Document
                      </a>
                    </div>
                  </div>
                ) : isPdf ? (
                  <iframe
                    key={`pdf-${retryKey}`}
                    src={fileUrl}
                    title={modalTitle}
                    className="w-full h-full rounded-2xl bg-white border border-slate-200 shadow-inner"
                    onLoad={() => setDocLoading(false)}
                    onError={() => {
                      setDocLoading(false);
                      setDocError(true);
                    }}
                  />
                ) : (
                  <img
                    key={`img-${retryKey}`}
                    src={fileUrl}
                    alt={modalTitle}
                    className="max-h-full max-w-full object-contain rounded-2xl shadow-sm border border-slate-200 bg-white"
                    onLoad={() => setDocLoading(false)}
                    onError={() => {
                      setDocLoading(false);
                      setDocError(true);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
