import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const ErrorState = ({
  title = "Something went wrong",
  message = "We couldn't load the requested data. Please try again later.",
  onRetry,
}) => {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-dashed border-rose-200/80 shadow-none bg-white rounded-xl">
      <div className="rounded-2xl bg-rose-50 p-3.5 mb-4 border border-rose-100 shadow-xs">
        <AlertCircle className="h-6 w-6 text-rose-600" />
      </div>
      <h3 className="text-lg font-extrabold text-[#1F1B2D] mb-1">{title}</h3>
      <p className="text-sm font-medium text-[#6B6480] max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="min-w-[120px] bg-white border-[#E5E0F5] hover:border-[#DDD6FE] hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-semibold shadow-xs">
          Try Again
        </Button>
      )}
    </Card>
  );
};
