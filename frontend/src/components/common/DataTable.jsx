import React from "react";
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
import { cn } from "@/utils";

export function DataTable({
  data = [],
  columns = [],
  isLoading,
  emptyMessage = "No records found.",
}) {
  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((row) => (
              <TableRow key={row}>
                {columns.map((col, i) => (
                  <TableCell key={i} className={col.className}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
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
      <div className="border border-[#E9D5FF] rounded-2xl p-8 bg-white shadow-sm">
        <EmptyState title="No Data" message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="border border-[#E9D5FF] rounded-2xl overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-gradient-to-r from-[#F5F3FF] via-[#FAF8FF] to-[#F5F3FF] border-b border-[#E9D5FF]">
          <TableRow className="border-b border-[#E9D5FF] hover:bg-transparent">
            {columns.map((col, i) => (
              <TableHead key={i} className={cn("text-xs font-bold uppercase tracking-wider text-[#5B21B6] h-11 px-4", col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-[#FAF8FF] transition-colors border-b border-[#F5F3FF] last:border-b-0">
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex} className={cn("px-4 py-3.5 text-[#1F1B2D] text-sm", col.className)}>
                  {col.cell
                    ? col.cell(item, rowIndex)
                    : String(item[col.accessorKey])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
