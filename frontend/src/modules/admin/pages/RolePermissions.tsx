import { Shield, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const RolePermissions = () => {
  const roles = [
    {
      name: 'ADMIN',
      description: 'Full system access, configuration, and result importing.',
      permissions: ['Manage Users & Roles', 'System Configuration', 'Import Results', 'Manage Masters (Campus, Branch, Semester)']
    },
    {
      name: 'PRINCIPAL',
      description: 'Institution-wide read access and analytics.',
      permissions: ['View Campus Analytics', 'View All Results', 'View At-Risk Students', 'View Remedial Classes']
    },
    {
      name: 'HOD',
      description: 'Branch-specific management and analytics.',
      permissions: ['View Branch Analytics', 'View Branch Results', 'View Branch At-Risk Students', 'Manage Branch Remedial']
    },
    {
      name: 'COORDINATOR',
      description: 'Academic support and attendance tracking.',
      permissions: ['Manage Remedial Classes', 'Track Attendance', 'Schedule Guest Lectures', 'View Assigned Backlogs']
    },
    {
      name: 'CTPO',
      description: 'Class-level management and student profiling.',
      permissions: ['View Class Results', 'View Class Students', 'Manage Class Notices', 'Enter Internal Marks']
    },
    {
      name: 'STUDENT',
      description: 'Individual student portal.',
      permissions: ['View Own Results', 'View Own Backlogs', 'View Own Marks', 'View Notices']
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map(role => (
        <Card key={role.name}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">{role.name}</CardTitle>
            </div>
            <CardDescription>{role.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Key Permissions:</h4>
            <ul className="space-y-2">
              {role.permissions.map((perm, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
