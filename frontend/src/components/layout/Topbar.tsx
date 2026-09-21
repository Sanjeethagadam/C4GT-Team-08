import React, { useEffect, useState } from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/notificationService';
import { apiClient } from '@/services/apiClient';
import { DynamicBreadcrumb } from './DynamicBreadcrumb';

interface TopbarProps {
  onMenuToggle?: () => void;
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle, title = "Dashboard" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (user) {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
        }
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.role === 'STUDENT') {
        try {
          const response = await apiClient.get('/students/me');
          if (response.data) {
            setStudentProfile(response.data);
          }
        } catch (e) {
          console.error('Failed to fetch student profile', e);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToNotifications = () => {
    const rolePath = user?.role?.toLowerCase() === 'student' ? 'student' : 
                     user?.role?.toLowerCase() === 'coordinator' ? 'coordinator' : 
                     user?.role?.toLowerCase() === 'ctpo' ? 'ctpo' : 'admin';
    navigate(`/${rolePath}/notifications`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      
      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
        <h1 className="text-lg font-semibold md:text-xl shrink-0">{title}</h1>
        <div className="hidden md:block border-l h-6 mx-2 border-slate-200"></div>
        <div className="hidden md:block">
          <DynamicBreadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" onClick={goToNotifications}>
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full" variant="destructive">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt="@user" />
                <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {user?.role === 'STUDENT' && studentProfile ? (
                  <>
                    <p className="text-sm font-medium leading-none text-slate-800">{studentProfile.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{studentProfile.rollNo}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {studentProfile.branchId?.name} • Year {studentProfile.year} • Sem {studentProfile.semesterId?.semesterName || studentProfile.semesterId?.semesterCode || '-'}
                    </p>
                  </>
                ) : user?.role === 'ADMIN' ? (
                  <>
                    <p className="text-sm font-medium leading-none">Administrator</p>
                    <p className="text-xs text-muted-foreground mt-1">Username: {user?.username}</p>
                    <p className="text-xs text-muted-foreground mt-1">Role: Administrator</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {user?.role}
                    </p>
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
