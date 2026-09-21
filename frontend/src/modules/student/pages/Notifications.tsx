import { useEffect, useState } from 'react';
import { LoadingSkeleton, ErrorState } from '@/components/common';
import { notificationService, type Notification } from '@/services/notificationService';
import { Bell, Check, Clock, CheckCircle2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const getNotificationDetails = (type: string) => {
  switch (type) {
    case 'BACKLOG': return { color: 'bg-rose-100 text-rose-600', path: '/student/backlogs' };
    case 'REMEDIAL': return { color: 'bg-blue-100 text-blue-600', path: '/student/remedial-classes' };
    case 'GUEST_LECTURE': return { color: 'bg-emerald-100 text-emerald-600', path: '/student/guest-lectures' };
    case 'RISK': return { color: 'bg-orange-100 text-orange-600', path: '/student/dashboard' };
    case 'SYSTEM': return { color: 'bg-indigo-100 text-indigo-600', path: '/student/dashboard' };
    default: return { color: 'bg-slate-100 text-slate-600', path: '/student/dashboard' };
  }
};

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAllNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleDownloadNotice = async (e: React.MouseEvent, noticeId: string) => {
    e.stopPropagation();
    try {
      const token = sessionStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${baseUrl}/notifications/notices/${noticeId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `notice_${noticeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Failed to download notice', err);
      alert('Failed to download the notice document.');
    }
  };

  const handleNavigate = async (path: string, notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkRead(new MouseEvent('click') as any, notification._id);
    }
    
    if (notification.referenceType === 'Notice') {
      return;
    }
    navigate(path);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border-4 border-indigo-400">
        <div className="px-8 py-6 border-b-4 border-emerald-500 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">NOTIFICATIONS CENTER</h1>
            <p className="text-slate-300 text-sm mt-1 font-semibold">Review your recent alerts and academic updates.</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-black hover:bg-emerald-500 transition-colors shrink-0 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-slate-300 p-12 text-center shadow-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 mb-4 shadow-sm">
            <Bell className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">No notifications</h3>
          <p className="text-slate-600 font-medium text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => {
            const { color, path } = getNotificationDetails(notification.notificationType);
            const isRead = notification.isRead;
            const isNotice = notification.referenceType === 'Notice';
            
            return (
              <div 
                key={notification._id} 
                onClick={() => handleNavigate(path, notification)}
                className={`cursor-pointer bg-white rounded-3xl p-6 transition-all hover:shadow-xl ${
                  isRead ? 'border-2 border-slate-200 shadow-sm opacity-75 hover:opacity-100' : 'border-4 border-indigo-300 shadow-lg ring-2 ring-indigo-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-3 rounded-full ${color}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                      <h4 className={`text-base font-black ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notification.title}
                      </h4>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 whitespace-nowrap bg-slate-100 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        {notification.createdAt ? format(new Date(notification.createdAt), 'MMM d, h:mm a') : 'Just now'}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm font-medium leading-relaxed">{notification.message}</p>
                    
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {isNotice && notification.noticeDetails?.documentPath && (
                        <>
                          <a 
                            href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000'}/uploads/notices/${notification.noticeDetails.documentPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 transition-colors shadow-sm"
                          >
                            <Bell className="w-4 h-4" /> View PDF
                          </a>
                          <button 
                            onClick={(e) => handleDownloadNotice(e, notification.referenceId as string)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                          >
                            <Download className="w-4 h-4" /> Download PDF
                          </button>
                        </>
                      )}
                      
                      {isNotice && notification.noticeDetails?.videoUrl && (
                        <a 
                          href={notification.noticeDetails.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                        >
                          <Bell className="w-4 h-4" /> Watch Video
                        </a>
                      )}
                      
                      {!isRead && (
                        <button 
                          onClick={(e) => handleMarkRead(e, notification._id)}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors shadow-sm"
                        >
                          <Check className="w-4 h-4" /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};