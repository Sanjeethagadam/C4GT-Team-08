import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

interface SearchFilterBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onFilterClick?: () => void;
  className?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  placeholder = "Search...",
  onSearch,
  onFilterClick,
  className
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 mb-6", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-9 bg-white"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      {onFilterClick && (
        <Button variant="outline" onClick={onFilterClick} className="shrink-0 bg-white">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      )}
    </div>
  );
};
