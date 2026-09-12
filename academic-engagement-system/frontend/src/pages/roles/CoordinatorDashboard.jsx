import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/dashboard.api';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { Users, BookOpen, Layers } from 'lucide-react';

export default function CoordinatorDashboard() {
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
      setError(err.response?.data?.message || 'Failed to load Coordinator metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading Academic Coordinator metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStats} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Coordinator Dashboard</h1>
            <Badge variant="info">Coordinator Portal</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Curriculum Alignment & Departmental Subject Monitoring
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="Branch Students"
          value={stats?.totalStudents ?? 0}
          icon={Users}
          color="indigo"
          subtitle="Enrolled Cohort"
        />
        <StatCard
          title="Curriculum Subjects"
          value={stats?.totalSubjects ?? 0}
          icon={BookOpen}
          color="blue"
          subtitle="Active Course Offerings"
        />
      </div>
    </div>
  );
}
