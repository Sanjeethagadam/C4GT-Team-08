import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { cn } from "@/utils";

export const NotificationPanel = ({ notifications, className }) => {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#1F1B2D]">
          <Bell className="h-5 w-5 text-[#7C3AED]" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-[#E5E0F5]">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-center text-[#6B6480]">
              No new notifications
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "p-4 flex flex-col gap-1 transition-colors hover:bg-[#F5F3FF]",
                  !notif.read && "bg-[#F5F3FF] border-l-[3px] border-l-[#7C3AED]",
                )}
              >
                <div className="flex justify-between items-start gap-2">
                  <h4
                    className={cn(
                      "text-sm font-medium",
                      !notif.read && "text-[#1F1B2D] font-bold",
                    )}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{notif.message}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
