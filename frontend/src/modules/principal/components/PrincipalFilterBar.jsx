import { useEffect, useState } from "react";
import { branchService } from "@/services/academicYearService";

export const PrincipalFilterBar = ({ onFilterChange }) => {
  const [branches, setBranches] = useState([]);
  const years = [1, 2, 3, 4];
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const branchesData = await branchService.getAllBranches();
        setBranches(branchesData);
      } catch (err) {
        console.error("Failed to load filters", err);
      }
    };
    loadFilters();
  }, []);

  const handleYearChange = (e) => {
    const v = e.target.value === "" ? "" : Number(e.target.value);
    setSelectedYear(v);
    onFilterChange({
      year: v === "" ? undefined : v,
      branchId: selectedBranch === "" ? undefined : selectedBranch,
    });
  };

  const handleBranchChange = (e) => {
    const v = e.target.value;
    setSelectedBranch(v);
    onFilterChange({
      year: selectedYear === "" ? undefined : selectedYear,
      branchId: v === "" ? undefined : v,
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-[#7DA0CA]/40 shadow-xs flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#5483B3]">
          Year of Study:
        </label>
        <select
          className="border border-[#7DA0CA]/40 rounded-lg shadow-2xs focus:ring-2 focus:ring-[#052659] focus:outline-none px-3 py-1.5 text-xs font-semibold bg-white text-[#021024]"
          value={selectedYear}
          onChange={handleYearChange}
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#5483B3]">Branch:</label>
        <select
          className="border border-[#7DA0CA]/40 rounded-lg shadow-2xs focus:ring-2 focus:ring-[#052659] focus:outline-none px-3 py-1.5 text-xs font-semibold bg-white text-[#021024]"
          value={selectedBranch}
          onChange={handleBranchChange}
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
