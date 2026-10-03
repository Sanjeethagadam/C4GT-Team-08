import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export const DashboardShell = ({ children, title }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Automatically dismiss mobile sheet when navigation changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full relative bg-[#edf4fb] text-[#021024]">
      {/* Reference Image 2: Light Blue Flowing Wave Silk Texture across all dashboards */}
      <div
        className="fixed inset-0 pointer-events-none bg-cover bg-right-top opacity-30 mix-blend-multiply z-0"
        style={{ backgroundImage: `url('/dashboard_light_blue_bg.png')` }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-white/50 via-transparent to-[#dce9f6]/60 z-0" />

      {/* Desktop Persistent Sidebar (220px) */}
      <Sidebar className="hidden md:flex md:w-[220px] md:flex-col md:fixed md:inset-y-0 z-40" />

      {/* Mobile Drawer Sidebar via shadcn Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[220px] border-r-0 bg-[#021024]">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main App Layout - seamlessly aligned to sidebar with zero gap */}
      <div className="flex flex-col md:pl-[220px] flex-1 min-w-0 relative z-10">
        <Topbar onMenuToggle={() => setIsMobileMenuOpen(true)} title={title} />

        {/* Responsive Content Container seamlessly connected to navigation */}
        <main className="flex-1 px-3.5 sm:px-5 lg:px-6 pt-3 pb-6 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1440px] space-y-4">{children}</div>
        </main>
      </div>
    </div>
  );
};
