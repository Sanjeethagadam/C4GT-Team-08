import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader, LoadingSkeleton, ErrorState, ExportButton } from '@/components/common';
import { ctpoService, type CtpoStudent } from '@/services/ctpoService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'LOW': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
    case 'MEDIUM': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    case 'HIGH': return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'AT-RISK': return 'bg-red-600 text-white hover:bg-red-600';
    default: return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
  }
};

export const Students = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<CtpoStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState(searchParams.get('risk') || 'ALL');
  const [backlogFilter, setBacklogFilter] = useState('ALL');

  // Sync state changes back to URL for shareability
  const handleRiskChange = (value: string) => {
    setRiskFilter(value);
    if (value === 'ALL') {
      searchParams.delete('risk');
    } else {
      searchParams.set('risk', value);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (riskFilter !== 'ALL') params.risk = riskFilter;
      if (backlogFilter !== 'ALL') params.backlog = backlogFilter;

      const data = await ctpoService.getStudentsList(params);
      setStudents(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to load student list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300); // debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm, riskFilter, backlogFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="My Students"
          description="View and filter all students assigned to your scope."
        />
        <div className="flex items-center gap-2">
          <ExportButton endpoint="students" filename="Student_Roster" title="Export" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 border rounded-xl shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by name or roll number..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full sm:w-auto ml-auto">
          <Select value={riskFilter} onValueChange={handleRiskChange}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Risks</SelectItem>
              <SelectItem value="LOW">Low Risk</SelectItem>
              <SelectItem value="MEDIUM">Medium Risk</SelectItem>
              <SelectItem value="HIGH">High Risk</SelectItem>
              <SelectItem value="AT-RISK">At Risk (Med/High)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={backlogFilter} onValueChange={setBacklogFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Backlogs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Backlogs</SelectItem>
              <SelectItem value="WITH">Has Backlogs</SelectItem>
              <SelectItem value="WITHOUT">No Backlogs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : students.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border shadow-sm text-slate-500">
          No students found matching the criteria.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-center">Active Backlog Count</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell className="font-medium">{student.rollNo}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.branch}</TableCell>
                  <TableCell>Year {student.year}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      student.activeBacklogCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {student.activeBacklogCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-semibold border-0 ${getRiskColor(student.riskLevel)}`}>
                      {student.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => navigate(`/ctpo/students/${student._id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
