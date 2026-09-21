import React from "react";
import { SearchX, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const EmptyState = ({
  title = "No data found",
  message = "There is currently no data to display here.",
  actionLabel,
  onAction,
  icon = "inbox",
}) => {
  const Icon = icon === "search" ? SearchX : Inbox;

  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-dashed border-[#E5E0F5] shadow-none bg-white rounded-xl">
      <div className="rounded-2xl bg-[#EDE9FE] p-3.5 mb-4 border border-[#DDD6FE] shadow-xs">
        <Icon className="h-6 w-6 text-[#7C3AED]" />
      </div>
      <h3 className="text-lg font-extrabold text-[#1F1B2D] mb-1">{title}</h3>
      <p className="text-sm font-medium text-[#6B6480] max-w-sm mb-6">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </Card>
  );
};
