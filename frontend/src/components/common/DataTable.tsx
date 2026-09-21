import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./EmptyState";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ 
  data = [], 
  columns = [], 
  isLoading,
  emptyMessage = "No records found."
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}><Skeleton className="h-4 w-20" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((row) => (
              <TableRow key={row}>
                {columns.map((col, i) => (
                  <TableCell key={i} className={col.className}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-md p-8">
        <EmptyState title="No Data" message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="border rounded-md bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i} className={col.className}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-slate-50/50">
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex} className={col.className}>
                  {col.cell ? col.cell(item, rowIndex) : String(item[col.accessorKey as keyof T])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
