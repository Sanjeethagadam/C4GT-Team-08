import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export const SearchFilterBar = ({
  placeholder = "Search records...",
  onSearch,
  onFilterClick,
  className,
  children,
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-2.5 mb-5", className)}>
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5483B3]" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-9 bg-white border-[#7DA0CA]/40 text-xs h-9 rounded-lg focus-visible:ring-[#052659]"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      {children}
      {onFilterClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onFilterClick}
          className="shrink-0 bg-white border-[#7DA0CA]/40 text-[#052659] hover:bg-[#C1E8FF]/30 h-9 text-xs font-semibold rounded-lg"
        >
          <Filter className="mr-1.5 h-3.5 w-3.5 text-[#5483B3]" />
          Filters
        </Button>
      )}
    </div>
  );
};
