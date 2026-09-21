import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export const SearchFilterBar = ({
  placeholder = "Search...",
  onSearch,
  onFilterClick,
  className,
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 mb-6", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-9 bg-white border-[#E9D5FF] rounded-xl shadow-sm focus-visible:ring-[#7C3AED]/20 focus-visible:border-[#7C3AED] text-[#0F172A]"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      {onFilterClick && (
        <Button
          variant="outline"
          onClick={onFilterClick}
          className="shrink-0 bg-white border-[#E9D5FF] hover:border-[#DDD6FE] hover:bg-[#F5F3FF] hover:text-[#7C3AED] rounded-xl shadow-sm text-[#0F172A] font-medium"
        >
          <Filter className="mr-2 h-4 w-4 text-[#6B7280]" />
          Filters
        </Button>
      )}
    </div>
  );
};
