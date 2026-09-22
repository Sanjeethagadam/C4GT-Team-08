import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState } from '@/components/common';
import { analyticsService } from '@/services/analyticsService';

export const CampusOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await analyticsService.getAcademicTrends();
    } catch (err: any) {
      setError(err.message || 'Failed to load campus overview data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <PageHeader 
        title="Campus Overview" 
        description="Institution-wide academic performance overview."
      />

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Campus Analytics</h3>
            <p className="text-slate-500 mb-4">Internal Assessment Trends have been removed as per new guidelines.</p>
          </div>
        </div>
      )}
    </>
  );
};
