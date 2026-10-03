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

export function DataTable({
  data = [],
  columns = [],
  isLoading,
  emptyMessage = "No records found.",
}) {
  if (isLoading) {
    return (
      <div className="border border-[#7DA0CA]/35 rounded-xl bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-[#052659]/5 border-b border-[#7DA0CA]/25">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  <Skeleton className="h-4 w-24 bg-[#7DA0CA]/20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((row) => (
              <TableRow key={row} className="border-b border-[#7DA0CA]/15">
                {columns.map((col, i) => (
                  <TableCell key={i} className={col.className}>
                    <Skeleton className="h-4 w-full bg-[#7DA0CA]/15" />
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
      <div className="border border-[#7DA0CA]/35 rounded-xl bg-white p-8 shadow-xs">
        <EmptyState title="No Data Available" message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="border border-[#7DA0CA]/40 rounded-2xl bg-gradient-to-br from-white via-[#fcfdff] to-[#f4f9fd] shadow-xs overflow-hidden relative">
      {/* Subtle translucent bubble decoration */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#C1E8FF]/20 blur-xl pointer-events-none" />
      <Table className="relative z-10">
        <TableHeader className="bg-gradient-to-r from-[#052659] via-[#083375] to-[#052659] border-b border-[#052659]">
          <TableRow className="hover:bg-transparent border-0">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={`text-white font-extrabold text-[11.5px] uppercase tracking-wider py-3.5 ${col.className || ""}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="hover:bg-[#C1E8FF]/25 odd:bg-white even:bg-[#f8fbfe]/80 transition-colors border-b border-[#7DA0CA]/20 last:border-0"
            >
              {columns.map((col, colIndex) => (
                <TableCell
                  key={colIndex}
                  className={`text-xs text-[#021024] py-3.5 font-medium ${col.className || ""}`}
                >
                  {col.cell
                    ? col.cell(item, rowIndex)
                    : String(item[col.accessorKey] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
