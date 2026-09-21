import React from 'react';
import { SearchX, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'search' | 'inbox';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "No data found", 
  message = "There is currently no data to display here.",
  actionLabel,
  onAction,
  icon = 'inbox'
}) => {
  const Icon = icon === 'search' ? SearchX : Inbox;

  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-dashed shadow-none bg-slate-50">
      <div className="rounded-full bg-slate-100 p-3 mb-4">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};
