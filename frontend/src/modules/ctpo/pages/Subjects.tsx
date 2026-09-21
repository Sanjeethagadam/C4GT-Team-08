import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState, DataTable } from '@/components/common';
import { examinationService } from '@/services/examinationService';
import { apiClient } from '@/services/apiClient';

export const Subjects = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get CTPO Assignment
      const assignments = await examinationService.getCtpoAssignments();
      if (!assignments || assignments.length === 0) {
        setSubjects([]);
        setIsLoading(false);
        return;
      }
      
      const activeAssignment = assignments[0];
      const branchId = typeof activeAssignment.branchId === 'object' ? activeAssignment.branchId._id : activeAssignment.branchId;
      const semesterId = typeof activeAssignment.semesterId === 'object' ? activeAssignment.semesterId._id : activeAssignment.semesterId;

      // 2. Fetch subject mappings for this branch and semester
      const response = await apiClient.get(`${getBase()}/subject-branch-mappings`);
      const mappings = response.data || [];
      
      const classSubjects = mappings
        .filter((m: any) => m.branchId?._id === branchId && m.semesterId?._id === semesterId)
        .map((m: any) => m.subjectId)
        .filter(Boolean);
        
      setSubjects(classSubjects);
    } catch (err: any) {
      setError(err.message || 'Failed to load class subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { 
      header: 'Subject Name', 
      cell: (row: any) => <span className="font-medium text-slate-700">{row.subjectName || '-'}</span> 
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Class Subjects" 
        description="View official subjects assigned to your class based on branch and semester."
      />

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        /* Fully Highlighted Table Container with full width stretch fix */
        <div className="bg-white rounded-3xl shadow-md border-2 border-indigo-100 overflow-hidden transition-all hover:shadow-lg [&_table]:w-full [&_thead]:bg-indigo-50/60 [&_thead]:border-b [&_thead]:border-indigo-100 [&_th]:font-bold [&_th]:text-slate-700 [&_th]:px-6 [&_th]:py-4 [&_td]:px-6 [&_td]:py-4">
          <DataTable 
            data={subjects} 
            columns={columns}
            emptyMessage="No subjects mapped for your assigned class semester."
          />
        </div>
      )}
    </div>
  );
};