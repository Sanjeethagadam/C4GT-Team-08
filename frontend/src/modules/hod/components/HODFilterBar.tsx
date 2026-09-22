import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { type Branch, branchService } from '@/services/academicYearService';

interface HODFilterBarProps {
  onFilterChange: (filters: { year?: number; branchId?: string }) => void;
}

export const HODFilterBar = ({ onFilterChange }: HODFilterBarProps) => {
  const { user } = useAuth();
  
  const [years, setYears] = useState<number[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const branchesData = await branchService.getAllBranches();
        
        const scope = (user as any)?.scope || {};
        const scopeRef = (user as any)?.scopeRef || {};
        const hodYear = scope.year;
        
        // Handle branch scope
        let hodBranchId = scope.branchId;
        if (scopeRef.type === 'Branch') {
            hodBranchId = scopeRef.refId;
        }

        let availableBranches = branchesData;
        if (hodBranchId) {
          availableBranches = availableBranches.filter(b => b._id === hodBranchId);
        }
        setBranches(availableBranches);
        
        // Handle year scope
        let availableYears = [1, 2, 3, 4];
        if (hodYear) {
          availableYears = [Number(hodYear)];
        }
        setYears(availableYears);
        
        const defaultYear = availableYears.length === 1 ? availableYears[0] : '';
        const defaultBranch = availableBranches.length === 1 ? availableBranches[0]._id : '';
        
        setSelectedYear(defaultYear);
        setSelectedBranch(defaultBranch);
        
        onFilterChange({ 
            year: defaultYear === '' ? undefined : defaultYear, 
            branchId: defaultBranch === '' ? undefined : defaultBranch 
        });
      } catch (err) {
        console.error('Failed to load filters', err);
      }
    };
    
    loadFilters();
  }, [user]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value === '' ? '' : Number(e.target.value);
    setSelectedYear(v);
    onFilterChange({ 
        year: v === '' ? undefined : v, 
        branchId: selectedBranch === '' ? undefined : selectedBranch 
    });
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setSelectedBranch(v);
    onFilterChange({ 
        year: selectedYear === '' ? undefined : selectedYear, 
        branchId: v === '' ? undefined : v 
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center mb-6">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Year of Study:</label>
        <select 
          className="border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-1.5 border text-sm disabled:bg-slate-100"
          value={selectedYear}
          onChange={handleYearChange}
          disabled={years.length <= 1}
        >
          {years.length > 1 && <option value="">All Years</option>}
          {years.map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Branch:</label>
        <select 
          className="border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-1.5 border text-sm disabled:bg-slate-100"
          value={selectedBranch}
          onChange={handleBranchChange}
          disabled={branches.length <= 1}
        >
          {branches.length > 1 && <option value="">All Branches</option>}
          {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
      </div>
    </div>
  );
};
