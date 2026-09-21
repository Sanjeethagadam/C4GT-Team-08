import { useEffect, useState } from 'react';
import { PageHeader, LoadingSkeleton, ErrorState } from '@/components/common';
import { apiClient } from '@/services/apiClient';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

interface Mapping {
  _id: string;
  subjectId: { _id: string; subjectName: string; subjectCode: string };
  branchId: { _id: string; name: string; code: string };
  semesterId: { _id: string; semesterCode: string; year: number };
}

export const Subjects = () => {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';
      const response = await apiClient.get(`${getBase()}/subject-branch-mappings`);
      setMappings(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load subject mappings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Group mappings by Branch -> Year -> Semester
  const groupedData: any = {};
  mappings.forEach((mapping) => {
    const branchName = mapping.branchId?.name || 'Unknown Branch';
    const year = mapping.semesterId?.year ? `Year ${mapping.semesterId.year}` : 'Unknown Year';
    const semester = mapping.semesterId?.semesterCode || 'Unknown Semester';

    if (!groupedData[branchName]) groupedData[branchName] = {};
    if (!groupedData[branchName][year]) groupedData[branchName][year] = {};
    if (!groupedData[branchName][year][semester]) groupedData[branchName][year][semester] = [];
    
    groupedData[branchName][year][semester].push(mapping);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Subjects Management" 
          description="View subjects organized by Branch, Year, and Semester."
        />
      </div>

      {isLoading ? (
        <LoadingSkeleton type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Accordion type="multiple" className="w-full">
              {Object.keys(groupedData).map((branchName, i) => (
                <AccordionItem key={branchName} value={`branch-${i}`}>
                  <AccordionTrigger className="text-lg font-semibold text-primary">
                    {branchName}
                  </AccordionTrigger>
                  <AccordionContent className="pl-4">
                    <Accordion type="multiple" className="w-full">
                      {Object.keys(groupedData[branchName]).map((yearName, j) => (
                        <AccordionItem key={yearName} value={`year-${i}-${j}`}>
                          <AccordionTrigger className="text-md font-medium text-slate-800">
                            {yearName}
                          </AccordionTrigger>
                          <AccordionContent className="pl-4">
                            <Accordion type="multiple" className="w-full">
                              {Object.keys(groupedData[branchName][yearName]).map((semName, k) => (
                                <AccordionItem key={semName} value={`sem-${i}-${j}-${k}`}>
                                  <AccordionTrigger className="text-sm font-medium text-slate-700">
                                    Semester {semName}
                                  </AccordionTrigger>
                                  <AccordionContent className="pl-4">
                                    <ul className="list-disc list-inside space-y-1">
                                      {groupedData[branchName][yearName][semName].map((m: Mapping) => (
                                        <li key={m._id} className="text-sm text-slate-600 py-1">
                                          {m.subjectId?.subjectName}
                                        </li>
                                      ))}
                                    </ul>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {Object.keys(groupedData).length === 0 && (
              <p className="text-center text-slate-500 py-8">No subjects mapped yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
