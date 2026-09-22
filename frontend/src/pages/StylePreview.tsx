import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { 
  PageHeader, 
  StatCard, 
  StatusBadge, 
  RiskBadge, 
  EmptyState, 
  ErrorState, 
  LoadingSkeleton,
  SearchFilterBar,
  NotificationPanel,
  DataTable,
  ConfirmDialog
} from '@/components/common';
import { Users, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const StylePreview = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const sampleColumns = [
    { header: 'ID', accessorKey: 'id' as const },
    { header: 'Name', accessorKey: 'name' as const },
    { 
      header: 'Status', 
      cell: (item: any) => <StatusBadge status={item.status} label={item.status} /> 
    },
  ];

  const sampleData = [
    { id: '1', name: 'Alice Smith', status: 'success' },
    { id: '2', name: 'Bob Jones', status: 'warning' },
    { id: '3', name: 'Charlie Brown', status: 'danger' },
  ];

  return (
    <DashboardShell title="Style Preview">
      <PageHeader 
        title="Design System Preview" 
        description="A showcase of all reusable components in their various states."
        action={<Button onClick={() => setShowConfirm(true)}>Show Dialog</Button>}
      />

      <ConfirmDialog 
        open={showConfirm} 
        onOpenChange={setShowConfirm}
        title="Confirm Action"
        description="Are you sure you want to proceed? This is just a preview."
        onConfirm={() => setShowConfirm(false)}
      />

      <div className="space-y-12 pb-12">
        {/* KPI Cards */}
        <section>
          <h3 className="text-lg font-medium mb-4">KPI Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Students" value="2,451" icon={Users} contextLine="+12% from last month" contextType="success" />
            <StatCard title="Overall Pass %" value="84.2%" icon={GraduationCap} contextLine="-2.1% from last semester" contextType="warning" />
            <StatCard title="High Risk Students" value="124" icon={AlertTriangle} contextLine="Requires immediate action" contextType="danger" />
            <StatCard title="Avg Attendance" value="91.5%" icon={TrendingUp} contextLine="Consistently good" contextType="neutral" />
          </div>
        </section>

        {/* Badges */}
        <section>
          <h3 className="text-lg font-medium mb-4">Status & Risk Badges</h3>
          <div className="flex flex-wrap gap-4">
            <StatusBadge status="success" label="Passed" />
            <StatusBadge status="warning" label="Pending" />
            <StatusBadge status="danger" label="Failed" />
            <StatusBadge status="info" label="In Progress" />
            <StatusBadge status="neutral" label="Archived" />
            <div className="border-l mx-2"></div>
            <RiskBadge level="high" />
            <RiskBadge level="medium" />
            <RiskBadge level="low" />
          </div>
        </section>

        {/* Search & Filter */}
        <section>
          <h3 className="text-lg font-medium mb-4">Search & Filter Bar</h3>
          <SearchFilterBar onFilterClick={() => {}} />
        </section>

        {/* Data Tables */}
        <section>
          <h3 className="text-lg font-medium mb-4">Data Table</h3>
          <DataTable data={sampleData} columns={sampleColumns} />
          
          <h4 className="text-md font-medium mt-6 mb-2">Loading State</h4>
          <DataTable data={[]} columns={sampleColumns} isLoading={true} />
        </section>

        {/* Empty & Error States */}
        <section>
          <h3 className="text-lg font-medium mb-4">States</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState title="No Students Found" message="Try adjusting your filters or search terms." actionLabel="Clear Filters" onAction={() => {}} icon="search" />
            <ErrorState onRetry={() => {}} />
          </div>
        </section>

        {/* Skeletons */}
        <section>
          <h3 className="text-lg font-medium mb-4">Loading Skeletons</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="text-lg font-medium mb-4">Notifications Panel</h3>
          <div className="max-w-md">
            <NotificationPanel notifications={[
              { id: '1', title: 'New Result Published', message: 'B.Tech Sem 4 results are out.', time: '2m ago', read: false },
              { id: '2', title: 'Risk Alert', message: '5 new students moved to high risk.', time: '1h ago', read: false },
              { id: '3', title: 'System Update', message: 'Maintenance scheduled for tonight.', time: '1d ago', read: true },
            ]} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};
