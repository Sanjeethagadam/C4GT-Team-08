import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = "Something went wrong", 
  message = "We couldn't load the requested data. Please try again later.",
  onRetry 
}) => {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-dashed shadow-none bg-slate-50">
      <div className="rounded-full bg-rose-100 p-3 mb-4">
        <AlertCircle className="h-6 w-6 text-rose-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="min-w-[120px]">
          Try Again
        </Button>
      )}
    </Card>
  );
};
