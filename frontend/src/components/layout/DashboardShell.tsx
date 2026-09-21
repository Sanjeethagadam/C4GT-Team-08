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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full bg-[#DCEBFE] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:inset-y-0 z-40 bg-transparent p-3">
        <Sidebar className="w-full h-full rounded-3xl bg-[#F0F6FF]/80 backdrop-blur-xl border border-blue-200/60 shadow-lg shadow-blue-500/5" />
      </aside>

      {/* Mobile Sidebar via Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-0 bg-[#F0F6FF]">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Floating Content Container */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden p-3 md:pl-0">
        <div className="flex flex-col flex-1 bg-[#F5F9FF]/90 backdrop-blur-2xl rounded-3xl border border-blue-200/70 shadow-xl shadow-blue-500/5 overflow-hidden">
          <header className="z-30 bg-[#F5F9FF]/80 backdrop-blur-md border-b border-blue-100">
            <Topbar onMenuToggle={() => setIsMobileMenuOpen(true)} title={title} />
          </header>
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};