import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, title }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40" />

      {/* Mobile Sidebar via Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col md:pl-64 flex-1">
        <Topbar onMenuToggle={() => setIsMobileMenuOpen(true)} title={title} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
