import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState } from '@/components/common';
import { ctpoService } from '@/services/ctpoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, FileText, Trash2, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Notices = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [noticeType, setNoticeType] = useState('ACADEMIC_NOTICE');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ctpoService.getNotices();
      setNotices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setUploadMessage({ type: 'error', text: 'Only PDF files are allowed.' });
        setFile(null);
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setUploadMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !noticeType) {
      setUploadMessage({ type: 'error', text: 'Please fill all required fields and select a PDF.' });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('title', title);
      formData.append('noticeType', noticeType);
      if (description) formData.append('description', description);

      await ctpoService.uploadNotice(formData);
      
      setUploadMessage({ type: 'success', text: 'Notice uploaded successfully. You can now publish it.' });
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await loadData();
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.message || 'Failed to upload notice' });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const estimateRes = await ctpoService.estimateNotice(id);
      const count = estimateRes?.estimatedCount || 0;
      
      if (!window.confirm(`Target Audience: Your Assigned Class\nEstimated Student Count: ${count}\n\nAre you sure you want to publish this notice?`)) return;
      
      const publishRes = await ctpoService.publishNotice(id);
      const stats = publishRes?.stats;
      
      alert(`Notice published successfully!\n\nTargeted: ${stats?.targeted || 0}\nCreated: ${stats?.created || 0}\nDuplicates Skipped: ${stats?.duplicatesSkipped || 0}`);
      
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish');
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!window.confirm('Are you sure you want to unpublish this notice?')) return;
    try {
      await ctpoService.unpublishNotice(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to unpublish');
    }
  };

  const handleViewStats = async (id: string) => {
    try {
      const data = await ctpoService.getNoticeStats(id);
      alert(`Acknowledgement Stats:\n\nTotal Targeted: ${data.totalTargeted}\nViewed: ${data.viewed}\nNot Viewed: ${data.notViewed}\nView Percentage: ${data.viewPercentage}%`);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch stats');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await ctpoService.deleteNotice(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleViewPdf = async (id: string) => {
    try {
      const token = sessionStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${baseUrl}/notifications/notices/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err: any) {
      alert('Failed to open PDF document.');
    }
  };

  if (isLoading && notices.length === 0) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Class Notices & Timetables" 
        description="Upload and broadcast official PDF documents strictly to your assigned class."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Document Section - Highlighted with strong Indigo Border */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-lg border-2 border-indigo-400 h-fit transition-all hover:shadow-xl">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            Upload Document
          </h3>

          {uploadMessage && (
            <div className={`p-3 rounded-2xl mb-4 text-sm font-medium ${uploadMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {uploadMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Mid-1 Timetable" 
                className="rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Document Type *</label>
              <Select value={noticeType} onValueChange={setNoticeType}>
                <SelectTrigger className="rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 bg-slate-50/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 border-indigo-100 shadow-lg">
                  <SelectItem value="Mid-1 Notification">Mid-1 Notification</SelectItem>
                  <SelectItem value="Mid-1 Timetable">Mid-1 Timetable</SelectItem>
                  <SelectItem value="Mid-2 Notification">Mid-2 Notification</SelectItem>
                  <SelectItem value="Mid-2 Timetable">Mid-2 Timetable</SelectItem>
                  <SelectItem value="Class Timetable">Class Timetable</SelectItem>
                  <SelectItem value="Semester Timetable">Semester Timetable</SelectItem>
                  <SelectItem value="Semester Examination Timetable">Semester Examination Timetable</SelectItem>
                  <SelectItem value="Other Academic Notification">Other Academic Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
              <Input 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Brief context..." 
                className="rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">PDF File *</label>
              <Input 
                id="pdf-upload" 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange} 
                className="cursor-pointer rounded-2xl border-2 border-indigo-200 bg-slate-50/50 file:text-indigo-700 file:font-semibold file:bg-indigo-100 file:border-0 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl hover:file:bg-indigo-200" 
              />
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !file || !title} 
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 shadow-md transition-all"
            >
              {isUploading ? 'Uploading...' : 'Upload Notice'}
            </Button>
          </div>
        </div>

        {/* Uploaded Documents List Container - Highlighted with strong Indigo Border */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Uploaded Documents
          </h3>

          {error && <ErrorState message={error} onRetry={loadData} />}

          {notices.length === 0 && !error ? (
            <div className="bg-white p-8 text-center rounded-3xl shadow-lg border-2 border-indigo-400 text-slate-500 font-medium">
              No notices uploaded yet.
            </div>
          ) : (
            notices.map(notice => (
              <div 
                key={notice._id} 
                className="bg-white p-5 rounded-3xl shadow-lg border-2 border-indigo-300 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-xl"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-bold text-slate-800">{notice.title}</h4>
                    <Badge variant="secondary" className="text-xs rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                      {notice.noticeType}
                    </Badge>
                    {notice.isPublished ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-1 rounded-xl font-medium">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 ml-1 rounded-xl font-medium">
                        Draft
                      </Badge>
                    )}
                  </div>
                  {notice.description && <p className="text-sm text-slate-600 mb-2 font-medium">{notice.description}</p>}
                  <p className="text-xs text-slate-400 font-medium">Uploaded: {new Date(notice.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewPdf(notice._id)}
                    className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium"
                  >
                    View PDF
                  </Button>
                  
                  {!notice.isPublished ? (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handlePublish(notice._id)} 
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      Publish
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewStats(notice._id)}
                        className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium"
                      >
                        Stats
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUnpublish(notice._id)}
                        className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 font-medium"
                      >
                        Unpublish
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(notice._id)} 
                    className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
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