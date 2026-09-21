import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { cn } from '@/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  className?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, className }) => {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-center text-slate-500">
              No new notifications
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-4 flex flex-col gap-1 transition-colors hover:bg-slate-50",
                  !notif.read && "bg-slate-50/50 border-l-2 border-l-primary"
                )}
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className={cn("text-sm font-medium", !notif.read && "text-slate-900")}>
                    {notif.title}
                  </h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{notif.time}</span>
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
