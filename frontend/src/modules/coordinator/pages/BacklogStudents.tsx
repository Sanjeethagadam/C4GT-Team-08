import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { backlogService, type BacklogStudent } from '@/services/backlogService';
import { Search } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

export const BacklogStudents = () => {
  const [students, setStudents] = useState<BacklogStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [branches, setBranches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    branchId: '',
    year: '',
    semesterCode: '',
    sectionId: '',
    subjectId: ''
  });

  const loadDependencies = async () => {
    try {
      const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';
      const [branchRes, subRes, secRes, semRes] = await Promise.all([
        apiClient.get(`${getBase()}/branches`),
        apiClient.get(`${getBase()}/subjects`),
        apiClient.get(`${getBase()}/sections`),
        apiClient.get(`${getBase()}/semesters`)
      ]);
      setBranches(branchRes.data || []);
      setSubjects(subRes.data || []);
      const rawSections = secRes.data || [];
      const allowedNames = ['CSM', 'CAI', 'CSD', 'AID', 'CSC'];
      const uniqueSections = [];
      const seenNames = new Set();
      for (const s of rawSections) {
        if (allowedNames.includes(s.sectionName) && !seenNames.has(s.sectionName)) {
          uniqueSections.push(s);
          seenNames.add(s.sectionName);
        }
      }
      setSections(uniqueSections);
      const rawSemesters = semRes.data || [];
      const uniqueSemestersMap = new Map();
      for (const s of rawSemesters) {
        if (!uniqueSemestersMap.has(s.semesterCode)) {
          uniqueSemestersMap.set(s.semesterCode, s);
        }
      }
      const uniqueSemesters = Array.from(uniqueSemestersMap.values()).sort((a: any, b: any) => 
        a.semesterCode.localeCompare(b.semesterCode)
      );
      setSemesters(uniqueSemesters);
    } catch (e) {
      console.error(e);
    }
  };

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadData = async (currentPage = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await backlogService.getBacklogStudents({ ...filters, page: currentPage, limit: 50 });
      setStudents(result.data);
      setTotal(result.pagination.total);
      setPage(result.pagination.page);
    } catch (err: any) {
      setError(err.message || 'Failed to load backlog students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDependencies();
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1);
  };

  const handleNextPage = () => {
    if (page * 50 < total) loadData(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) loadData(page - 1);
  };

  return (
    <>
      <div className="mb-6">
        <PageHeader 
          title="Active Backlog Students" 
          description="View students currently carrying active backlogs to identify academic support needs."
        />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Branch</label>
            <select 
              className="w-full text-sm p-2 border rounded-md"
              value={filters.branchId}
              onChange={e => setFilters({...filters, branchId: e.target.value})}
            >
              <option value="">All Branches</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.code}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
            <select 
              className="w-full text-sm p-2 border rounded-md"
              value={filters.year}
              onChange={e => setFilters({...filters, year: e.target.value})}
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
            <select 
              className="w-full text-sm p-2 border rounded-md"
              value={filters.sectionId}
              onChange={e => setFilters({...filters, sectionId: e.target.value})}
            >
              <option value="">All Sections</option>
              {sections.map(s => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Backlog Semester</label>
            <select 
              className="w-full text-sm p-2 border rounded-md"
              value={filters.semesterCode}
              onChange={e => setFilters({...filters, semesterCode: e.target.value})}
            >
              <option value="">All Semesters</option>
              {semesters.map(s => <option key={s.semesterCode} value={s.semesterCode}>{s.semesterCode}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Backlog Subject</label>
            <select 
              className="w-full text-sm p-2 border rounded-md"
              value={filters.subjectId}
              onChange={e => setFilters({...filters, subjectId: e.target.value})}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white rounded-md p-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-800"
            >
              <Search className="w-4 h-4" /> Filter
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(page)} />
      ) : (
        <div className="space-y-4">
          <DataTable 
            data={students}
            columns={[
              { header: 'HTNO', cell: (row) => row.student?.rollNo || '-' },
              { header: 'Name', cell: (row) => row.student?.name || '-' },
              { header: 'Branch', cell: (row) => row.student?.branch?.code || '-' },
              { header: 'Year', cell: (row) => `Y${row.student?.year || '-'}` },
              { header: 'Active Backlogs', cell: (row) => (
                <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{row.activeBacklogCount}</span>
              )},
              { header: 'Backlog Subjects', cell: (row) => (
                <div className="max-w-xs truncate text-xs" title={row.backlogs.map((b:any) => b.subjectId?.subjectName).join(', ')}>
                  {row.backlogs.map((b:any) => b.subjectId?.subjectCode).join(', ')}
                </div>
              )},
              { header: 'Semesters', cell: (row) => (
                <span className="text-xs text-slate-500">{[...new Set(row.backlogs.map((b:any) => b.academicSemesterId?.semesterCode || '-'))].join(', ')}</span>
              )},
            ]}
            emptyMessage="No backlog students found matching criteria."
          />
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm text-slate-600">Showing {Math.min((page - 1) * 50 + 1, total)} to {Math.min(page * 50, total)} of {total} records</span>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevPage} 
                disabled={page === 1}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md disabled:opacity-50 text-sm font-medium"
              >
                Previous
              </button>
              <button 
                onClick={handleNextPage} 
                disabled={page * 50 >= total}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md disabled:opacity-50 text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
