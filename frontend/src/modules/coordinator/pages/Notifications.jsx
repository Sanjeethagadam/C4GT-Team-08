import { useEffect, useState } from "react";
import { PageHeader, LoadingSkeleton, ErrorState } from "@/components/common";
import { notificationService } from "@/services/notificationService";
import { Bell, Check, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const getNotificationDetails = (type) => {
  switch (type) {
    case "BACKLOG":
      return {
        color: "bg-rose-100 text-rose-600",
        path: "/coordinator/backlog-students",
      };
    case "REMEDIAL":
      return {
        color: "bg-blue-100 text-blue-600",
        path: "/coordinator/remedial-classes",
      };
    case "GUEST_LECTURE":
      return {
        color: "bg-emerald-100 text-emerald-600",
        path: "/coordinator/guest-lectures",
      };
    case "RESULT_IMPORT":
      return {
        color: "bg-[#EDE9FE] text-[#7C3AED]",
        path: "/coordinator/dashboard",
      };
    default:
      return {
        color: "bg-slate-100 text-slate-600",
        path: "/coordinator/dashboard",
      };
  }
};

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAllNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const [activeTab, setActiveTab] = useState("ALL");

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "REMEDIAL" && n.notificationType === "REMEDIAL")
      return true;
    if (activeTab === "GUEST_LECTURE" && n.notificationType === "GUEST_LECTURE")
      return true;
    if (
      activeTab === "SYSTEM" &&
      !["REMEDIAL", "GUEST_LECTURE"].includes(n.notificationType)
    )
      return true;
    return false;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Notifications Center"
          description="Review system alerts and student communications."
        />

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "ALL", label: "All Notifications" },
          { id: "REMEDIAL", label: "Remedial" },
          { id: "GUEST_LECTURE", label: "Guest Lectures" },
          { id: "SYSTEM", label: "System Alerts" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No notifications
          </h3>
          <p className="text-slate-500">
            You're all caught up in this category!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const { color, path } = getNotificationDetails(
              notification.notificationType,
            );
            const isRead = notification.isRead;
            return (
              <div
                key={notification._id}
                onClick={() => handleNavigate(path)}
                className={`cursor-pointer bg-white rounded-xl border p-4 sm:p-6 transition-all hover:bg-slate-50 ${
                  isRead
                    ? "border-slate-200 shadow-sm"
                    : "border-primary/30 shadow-md ring-1 ring-primary/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-full ${color}`}>
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <h4
                        className={`text-base font-semibold ${isRead ? "text-slate-700" : "text-slate-900"}`}
                      >
                        {notification.title}
                      </h4>
                      <span className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {notification.createdAt
                          ? format(
                              new Date(notification.createdAt),
                              "MMM d, h:mm a",
                            )
                          : "Just now"}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mt-1">
                      {notification.message}
                    </p>

                    {!isRead && (
                      <button
                        onClick={(e) => handleMarkRead(e, notification._id)}
                        className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <Check className="w-4 h-4" /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
