import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/dashboard.api';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { Users, BookOpen, Layers, Award, Building2 } from 'lucide-react';

export default function HODDashboard() {
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
      setError(err.response?.data?.message || 'Failed to load HOD departmental metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading HOD Department Metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStats} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Head of Department (HOD) Overview</h1>
            <Badge variant="primary">HOD Portal</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Departmental Year-4 Academic Monitoring & Faculty Coordination
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={Users}
          color="indigo"
          subtitle="Department Enrolled"
        />
        <StatCard
          title="Sections"
          value={stats?.totalSections ?? 0}
          icon={Layers}
          color="emerald"
          subtitle="Class Sections"
        />
        <StatCard
          title="Subjects"
          value={stats?.totalSubjects ?? 0}
          icon={BookOpen}
          color="blue"
          subtitle="Assigned Curriculum Courses"
        />
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Department Governance</h2>
        </div>
        <p className="text-sm text-slate-600">
          CTPO branch evaluations, mid examination schedules, and student risk analytics are updated dynamically in real time.
        </p>
      </div>
    </div>
  );
}
