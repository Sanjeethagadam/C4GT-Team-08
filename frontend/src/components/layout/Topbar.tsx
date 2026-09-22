import React, { useEffect, useState } from 'react';
import { getAvatarUrl } from '@/utils/urlUtils';
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
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/notificationService';
import { studentService } from '@/services/studentService';
import { DynamicBreadcrumb } from './DynamicBreadcrumb';
import { ProfileModal } from '../common/ProfileModal';

interface TopbarProps {
  onMenuToggle?: () => void;
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle, title = "Dashboard" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [, setForceUpdate] = useState(0);

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
          const profileData = await studentService.getProfile();
          if (profileData) {
            setStudentProfile(profileData);
          }
        } catch (e) {
          console.error('Failed to fetch student profile', e);
        }
      }
    };
    fetchProfile();
    
    const handleProfileUpdate = async () => {
        setForceUpdate(prev => prev + 1); // Force topbar to render avatar changes
        try {
            // Re-fetch me
            const meData = await authService.validateToken();
            if (meData && meData.user) {
                // We update local storage user if using it
                // but useAuth might not expose a direct set user method.
                // Assuming it re-reads if we can trigger it, but for now we rely on the context updating or local storage.
            }
            fetchProfile(); // Re-fetch student profile
        } catch(e) {}
    };
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToNotifications = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/notices');
      return;
    }
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
        {user?.role !== 'PRINCIPAL' && (
          <Button variant="ghost" size="icon" className="relative" onClick={goToNotifications}>
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full" variant="destructive">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getAvatarUrl(user?.avatarFileId || user?.avatar)} alt="@user" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {user?.role === 'STUDENT' ? (
                  <>
                    <p className="text-sm font-medium leading-none text-slate-800">{studentProfile?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Role: Student</p>
                    <p className="text-xs text-slate-500 mt-1">{studentProfile?.rollNo}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {studentProfile?.year ? `Year ${studentProfile.year} • Semester ${(studentProfile?.semesterId as any)?.semesterCode || '-'}` : ''}
                    </p>
                  </>
                ) : user?.role === 'ADMIN' ? (
                  <>
                    <p className="text-sm font-medium leading-none">{(user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username) || 'Administrator'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Role: ADMIN</p>
                    <p className="text-xs text-muted-foreground mt-1">System-level scope</p>
                  </>
                ) : user?.role === 'PRINCIPAL' ? (
                  <>
                    <p className="text-sm font-medium leading-none">{(user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username) || 'Principal'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Role: PRINCIPAL</p>
                    <p className="text-xs text-muted-foreground mt-1">Campus / Institution scope</p>
                  </>
                ) : user?.role === 'COORDINATOR' ? (
                  <>
                    <p className="text-sm font-medium leading-none">{(user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username) || 'Coordinator'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Role: COORDINATOR</p>
                    <p className="text-xs text-muted-foreground mt-1">Academic Support scope</p>
                  </>
                ) : user?.role === 'HOD' ? (
                  <>
                    <p className="text-sm font-medium leading-none">{(user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username) || 'HOD'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Role: HOD</p>
                    <p className="text-xs text-muted-foreground mt-1">Academic Year scope</p>
                  </>
                ) : user?.role === 'CTPO' ? (
                  <>
                    <p className="text-sm font-medium leading-none">{(user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username) || 'CTPO'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Role: CTPO</p>
                    {user?.scope && (
                       <p className="text-xs text-muted-foreground mt-1">
                         Branch: {(user.scope as any).branch || (user.scope as any).branchId || 'Assigned Branch'} • Year {user.scope.year || '-'}
                       </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium leading-none">
                      {(user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username) || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {user?.role}
                    </p>
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
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

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={user} 
        studentProfile={studentProfile} 
      />
    </header>
  );
};
