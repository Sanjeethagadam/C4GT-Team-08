import { PageHeader } from '@/components/common';
import { Users as UsersView } from './Users'; // Reuse logic or separate if complex

export const RolesAccess = () => {
  return (
    <>
      <PageHeader 
        title="Roles & Access Configuration" 
        description="Assign roles and configure system permissions for users."
      />
      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-6">
        This view is primarily for configuring robust role-based access control. Currently handled via User Management.
      </div>
      <UsersView />
    </>
  );
};
