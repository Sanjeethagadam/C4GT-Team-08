import { useEffect, useState } from 'react';
import { type Branch, branchService } from '@/services/academicYearService';

interface PrincipalFilterBarProps {
  onFilterChange: (filters: { year?: number; branchId?: string }) => void;
}

export const PrincipalFilterBar = ({ onFilterChange }: PrincipalFilterBarProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const years = [1, 2, 3, 4];
  
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const branchesData = await branchService.getAllBranches();
        setBranches(branchesData);
      } catch (err) {
        console.error('Failed to load filters', err);
      }
    };
    loadFilters();
  }, []);

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
          className="border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-1.5 border text-sm"
          value={selectedYear}
          onChange={handleYearChange}
        >
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Branch:</label>
        <select 
          className="border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-1.5 border text-sm"
          value={selectedBranch}
          onChange={handleBranchChange}
        >
          <option value="">All Branches</option>
          {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
      </div>
    </div>
  );
};
