import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/dashboard.api';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { Building2, Users, Award, ShieldCheck } from 'lucide-react';

export default function PrincipalDashboard() {
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
      setError(err.response?.data?.message || 'Failed to load Principal executive dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading Principal Executive Overview..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStats} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Principal Executive Dashboard</h1>
            <Badge variant="warning">Executive Level</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Campus-wide Academic Oversight & Performance Statistics
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
          subtitle="Enrolled Across Campus"
        />
        <StatCard
          title="Academic Branches"
          value={stats?.totalBranches ?? 0}
          icon={Building2}
          color="emerald"
          subtitle="All Engineering Programs"
        />
        <StatCard
          title="Faculty & CTPO"
          value={stats?.totalFaculty ?? 0}
          icon={ShieldCheck}
          color="blue"
          subtitle="Authorized Academic Officers"
        />
        <StatCard
          title="Campus Scope"
          value={stats?.campus || 'Main Campus'}
          icon={Award}
          color="amber"
          subtitle="Institutional Jurisdiction"
        />
      </div>
    </div>
  );
}
