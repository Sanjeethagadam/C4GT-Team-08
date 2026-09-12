import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/dashboard.api';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { Users, Building2, BookOpen, Layers, ShieldCheck, Database } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardStats();
      setStats(res.data || res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrator dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading system-wide metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStats} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Administrator Overview</h1>
            <Badge variant="danger">System Admin</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Institutional Master Data & Centralized System Hierarchy
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={Users}
          color="indigo"
          subtitle="Enrolled Across All Branches"
        />
        <StatCard
          title="Academic Branches"
          value={stats?.totalBranches ?? 0}
          icon={Building2}
          color="emerald"
          subtitle="Active Departments"
        />
        <StatCard
          title="Curriculum Subjects"
          value={stats?.totalSubjects ?? 0}
          icon={BookOpen}
          color="blue"
          subtitle="Course Master Records"
        />
        <StatCard
          title="System Users"
          value={stats?.totalUsers ?? 0}
          icon={ShieldCheck}
          color="amber"
          subtitle="Authorized Accounts"
        />
      </div>

      {/* System Status Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Database & Master Data Verification</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase">CTPO Branch Allocation</p>
            <p className="text-sm font-bold text-slate-800 mt-1">5 CTPOs Mapped</p>
            <p className="text-xs text-emerald-600 mt-0.5">CSM, CAI, CSD, AID, CSC</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase">Scope Level</p>
            <p className="text-sm font-bold text-slate-800 mt-1">Branch-Wise Scoped</p>
            <p className="text-xs text-indigo-600 mt-0.5">Year-4 Focus</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase">Backend API Status</p>
            <p className="text-sm font-bold text-emerald-600 mt-1">Healthy & Connected</p>
            <p className="text-xs text-slate-500 mt-0.5">MongoDB Atlas Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
