import { useState, useEffect } from 'react';
import { PageHeader, DataTable } from '@/components/common';
import { importService } from '@/services/importService';
import { academicConfigService } from '@/services/academicConfigService';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Loader2, ArrowRight } from 'lucide-react';

export const ResultImport = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [previewData, setPreviewData] = useState<any>(null);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await academicConfigService.getAllSemesters();
        setSemesters(data || []);
      } catch (err) {
        console.error('Failed to load semesters', err);
      }
    };
    fetchSemesters();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      if (!selectedSemester) {
         throw new Error('Please select an academic semester');
      }
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const data = await importService.previewResults(file, isPdf ? 'pdf' : 'csv', selectedSemester);
      setPreviewData(data);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to process file. Please ensure it is a valid JNTUK result document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewData) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const data = await importService.confirmImport({
        importData: previewData.previewData,
        fileName: file?.name
      });
      setImportSummary({ imported: data.importedCount, skipped: 0 });
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm import.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setFile(null);
    setPreviewData(null);
    setImportSummary(null);
    setError(null);
    setStep(1);
  };

  return (
    <>
      <PageHeader 
        title="JNTUK Result Import" 
        description="Upload and extract official JNTUK PDF results to update system backlogs and profiles."
      />

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="max-w-xl mx-auto text-center">
            <div className="mb-6 inline-flex p-4 rounded-full bg-primary/10 text-primary">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Result Document</h3>
            <p className="text-slate-500 mb-8">
              Select a JNTUK PDF result file. The system will extract roll numbers, subject codes, and grades automatically.
            </p>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-10 bg-slate-50 hover:bg-slate-100 transition-colors">
              <input 
                type="file" 
                id="result-file" 
                className="hidden" 
                accept=".pdf,.csv"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="result-file"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileText className="w-8 h-8 text-slate-400 mb-3" />
                <span className="text-sm font-medium text-primary hover:underline">Click to browse</span>
                <span className="text-xs text-slate-500 mt-1">PDF or CSV up to 10MB</span>
              </label>
              
              {file && (
                <div className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {file.name}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full max-w-xs mx-auto p-2 border border-slate-300 rounded-md"
              >
                <option value="">-- Select Semester --</option>
                {semesters.map(s => (
                  <option key={s._id} value={s._id}>{s.semesterCode}</option>
                ))}
              </select>
            </div>

            <div className="mt-8">
              <button
                onClick={handlePreview}
                disabled={!file || !selectedSemester || isProcessing}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Extract & Preview'}
                {!isProcessing && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && previewData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-semibold text-slate-900">Extraction Preview</h3>
              <p className="text-sm text-slate-500">
                Found {previewData.stats?.totalExtracted || 0} records for semester {previewData.stats?.detectedSemester || 'Unknown'}. 
                <span className="text-emerald-600 font-medium ml-2">{previewData.stats?.matchedCount || 0} valid</span>, 
                <span className="text-rose-600 font-medium ml-2">{previewData.stats?.unmatchedHtnosCount || 0} unmatched HTNOs</span>,
                <span className="text-rose-600 font-medium ml-2">{previewData.stats?.unmatchedSubjectsCount || 0} unmatched Subjects</span>,
                <span className="text-amber-600 font-medium ml-2">{previewData.stats?.fCount || 0} F grades</span>,
                <span className="text-amber-600 font-medium ml-2">{previewData.stats?.abCount || 0} AB grades</span>.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={resetFlow}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                disabled={isProcessing}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm & Import
              </button>
            </div>
          </div>

          <DataTable 
            data={previewData.previewData || []}
            columns={[
              { header: 'Roll Number', cell: (row: any) => row.rollNo },
              { header: 'Subject Name', cell: (row: any) => row.subjectName || 'Unknown Subject' },
              { header: 'Internal Marks', cell: (row: any) => row.internalMarks },
              { header: 'Grade', cell: (row: any) => <span className="font-medium">{row.grade}</span> },
              { header: 'Status', cell: () => {
                return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3"/> Mapped</span>;
              }}
            ]}
            emptyMessage="No results extracted."
          />
        </div>
      )}

      {/* Step 3: Summary */}
      {step === 3 && importSummary && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="mb-6 inline-flex p-4 rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">Import Successful</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            The JNTUK results have been successfully imported and processed into the system. Backlogs and risk profiles have been updated.
          </p>
          
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{importSummary.imported || 0}</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">Imported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600">{importSummary.skipped || 0}</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">Skipped</div>
            </div>
          </div>

          <button
            onClick={resetFlow}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Import Another File
          </button>
        </div>
      )}

    </>
  );
};
