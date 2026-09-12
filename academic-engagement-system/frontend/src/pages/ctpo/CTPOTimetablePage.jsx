import React, { useState, useEffect } from "react";
import { getSemesters } from "../../api/semesters.api";
import {
  uploadTimetable,
  getBranchTimetables,
  deleteTimetable,
  getTimetableFileUrl,
  getTimetableDownloadUrl,
} from "../../api/timetables.api";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import {
  Calendar,
  Upload,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
  X,
  RefreshCw,
  Image as ImageIcon,
  Clock,
  Layers,
  FileUp,
} from "lucide-react";

export const CTPOTimetablePage = () => {
  const [semesters, setSemesters] = useState([]);
  const [timetables, setTimetables] = useState([]);

  // Form states
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [timetableType, setTimetableType] = useState("MID"); // 'MID' or 'SEMESTER'
  const [midExam, setMidExam] = useState("MID-1"); // 'MID-1' or 'MID-2' strictly
  const [file, setFile] = useState(null);

  // Statuses
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Preview Modal state
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [semRes, ttRes] = await Promise.all([
        getSemesters(),
        getBranchTimetables(),
      ]);

      const semsList = semRes.data || semRes || [];
      const ttList = ttRes.data || ttRes || [];

      const y4Sems = semsList.filter((s) => s.year === 4);
      const availableSems = y4Sems.length > 0 ? y4Sems : semsList;
      setSemesters(availableSems);

      if (availableSems.length > 0) {
        setSelectedSemesterId(availableSems[0]._id);
      }

      setTimetables(Array.isArray(ttList) ? ttList : []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(selected.type)) {
        setErrorMessage("Invalid file format. Please upload a PDF, PNG, JPG, or JPEG timetable file.");
        setFile(null);
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMessage("File size exceeds the 10MB limit.");
        setFile(null);
        return;
      }
      setErrorMessage("");
      setFile(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!selectedSemesterId) {
      setErrorMessage("Please select a target semester.");
      return;
    }

    if (!file) {
      setErrorMessage("Please select a timetable file to upload.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("semesterId", selectedSemesterId);
      formData.append("year", 4);
      formData.append("timetableType", timetableType);
      if (timetableType === "MID") {
        formData.append("midExam", midExam);
      }
      formData.append("file", file);

      await uploadTimetable(formData);
      setSuccessMessage("Timetable uploaded and published successfully!");
      setFile(null);

      // Reset file input
      const input = document.getElementById("timetable-file-input");
      if (input) input.value = "";

      // Refresh directly from backend
      const refreshRes = await getBranchTimetables();
      const updatedList = refreshRes.data || refreshRes || [];
      if (Array.isArray(updatedList)) setTimetables(updatedList);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to upload timetable");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this timetable schedule?")) return;
    try {
      await deleteTimetable(id);
      setTimetables((prev) => prev.filter((t) => t._id !== id));
      setSuccessMessage("Timetable deleted successfully.");
      if (selectedTimetable?._id === id) {
        setSelectedTimetable(null);
      }
    } catch (err) {
      setErrorMessage("Delete failed: " + err.message);
    }
  };

  const handleOpenPreview = (item) => {
    setSelectedTimetable(item);
    setDocLoading(true);
    setDocError(false);
    setRetryKey((prev) => prev + 1);

    // Safety timeout for PDF iframe loading state
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
    // Prefer authenticated download endpoint if ID exists, or fileUrl
    if (item._id) {
      return getTimetableDownloadUrl(item._id);
    }
    return getTimetableFileUrl(item.fileUrl, item._id);
  };

  if (loading) return <LoadingState message="Loading branch timetable schedules from database..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
          Timetable Schedule Management
        </h1>
        <p className="text-sm sm:text-[15px] text-slate-500 mt-0.5">
          Upload and manage official Mid & Semester schedules for your assigned branch students
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
        <div className="mb-5 flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-academic-50 border border-academic-100 flex items-center justify-center text-academic-700">
            <Upload className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Upload Timetable Schedule</h2>
            <p className="text-[13px] text-slate-500">Publish a schedule document to branch students</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target Semester */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Target Semester
              </label>
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-academic-500/20 cursor-pointer"
              >
                {semesters.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.semesterCode || `Semester ${s.semesterNumber}`} (Year {s.year || 4})
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule Category */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Schedule Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTimetableType("MID")}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    timetableType === "MID"
                      ? "bg-academic-800 text-white border-academic-900 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Mid Exam
                </button>
                <button
                  type="button"
                  onClick={() => setTimetableType("SEMESTER")}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    timetableType === "SEMESTER"
                      ? "bg-academic-800 text-white border-academic-900 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Semester Class
                </button>
              </div>
            </div>

            {/* MID Exam Number (Only when MID selected) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Examination Term
              </label>
              {timetableType === "MID" ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMidExam("MID-1")}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      midExam === "MID-1"
                        ? "bg-academic-800 text-white border-academic-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    MID-1
                  </button>
                  <button
                    type="button"
                    onClick={() => setMidExam("MID-2")}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      midExam === "MID-2"
                        ? "bg-academic-800 text-white border-academic-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    MID-2
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium">
                  Regular Semester Classwork Schedule
                </div>
              )}
            </div>
          </div>

          {/* File Upload Box */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Timetable Document (PDF, PNG, JPG, JPEG — Max 10MB)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-academic-400 rounded-2xl p-4 transition bg-slate-50/50 flex flex-col items-center justify-center gap-2">
              <input
                id="timetable-file-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="timetable-file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-11 h-11 rounded-xl bg-academic-50 border border-academic-200 text-academic-700 flex items-center justify-center">
                  <FileUp className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-academic-700 hover:underline">
                  Click to choose document or drag and drop here
                </span>
                <span className="text-xs sm:text-[13px] text-slate-400">
                  Supported formats: PDF, PNG, JPG, JPEG (up to 10MB)
                </span>
              </label>

              {file && (
                <div className="mt-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm flex items-center gap-2 shadow-xs">
                  <FileText className="w-4 h-4 text-academic-700" />
                  <span className="font-semibold text-slate-800">{file.name}</span>
                  <span className="text-slate-400 font-mono">({Math.round(file.size / 1024)} KB)</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-slate-400 hover:text-rose-600 p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading || !file}
              className="academic-button-primary px-6 py-2.5 text-sm sm:text-[15px]"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading Schedule...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publish Timetable</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Active Timetable Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Published Branch Timetables
            </h2>
            <p className="text-sm text-slate-500">Official schedules accessible by students</p>
          </div>
          <Badge variant="academic" size="md">
            {timetables.length} Schedules Active
          </Badge>
        </div>

        {timetables.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No timetable scheduled yet."
            description="Use the upload form above to publish official mid and semester class schedules."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetables.map((item) => {
              const isPdf = isPdfItem(item);
              const semCode = item.semesterId?.semesterCode || (item.semesterId?.semesterNumber ? `Semester ${item.semesterId.semesterNumber}` : "Year 4");
              const title = item.timetableType === "MID"
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
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
                        isPdf ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-sky-50 border-sky-100 text-sky-600"
                      }`}>
                        {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <Badge variant={item.timetableType === "MID" ? "academic" : "purple"} size="sm">
                        {item.timetableType === "MID" ? (item.midExam || "MID-1") : "SEMESTER"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-academic-800 transition-colors">
                        {title}
                      </h3>
                      <p className="text-[13px] sm:text-sm text-slate-500 mt-0.5">
                        {semCode} &bull; Year {item.year || 4}
                      </p>
                    </div>

                    <div className="text-xs sm:text-[13px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
                      <p>File: <span className="font-semibold text-slate-700 truncate">{item.fileName || item.file?.originalName || "Document"}</span></p>
                      <p>Published: <span className="text-slate-600">{uploadDate ? new Date(uploadDate).toLocaleDateString() : "Active"}</span></p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenPreview(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-academic-800 hover:bg-academic-900 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={getTimetableDownloadUrl(item._id)}
                        download
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete timetable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Critical Timetable Document Preview Modal */}
      {selectedTimetable && (() => {
        const item = selectedTimetable;
        const fileUrl = resolveFileUrl(item);
        const downloadUrl = getTimetableDownloadUrl(item._id);
        const isPdf = isPdfItem(item);
        const semCode = item.semesterId?.semesterCode || (item.semesterId?.semesterNumber ? `Semester ${item.semesterId.semesterNumber}` : "Year 4");
        const modalTitle = item.timetableType === "MID"
          ? `${item.midExam || "MID-1"} Examination Schedule`
          : "Semester Classwork Schedule";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              {/* Modal Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isPdf ? "bg-rose-50 border border-rose-100 text-rose-600" : "bg-sky-50 border border-sky-100 text-sky-600"
                  }`}>
                    {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{modalTitle}</h3>
                      <Badge variant={item.timetableType === "MID" ? "academic" : "purple"} size="sm">
                        {item.timetableType === "MID" ? (item.midExam || "MID-1") : "SEMESTER"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {semCode} &bull; Branch: {item.branchId?.code || "Branch"} &bull; Published: {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "Current"}
                    </p>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm font-semibold text-academic-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Open Full Screen</span>
                  </a>
                  <a
                    href={downloadUrl}
                    download
                    className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition"
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
                    <h4 className="text-base font-bold text-slate-900">
                      Unable to load timetable document.
                    </h4>
                    <p className="text-sm text-slate-500">
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
};

export default CTPOTimetablePage;
