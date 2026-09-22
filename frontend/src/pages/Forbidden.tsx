import { ErrorState } from '@/components/common';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const Forbidden = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleGoBack = () => {
    if (user?.role) {
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        <ErrorState 
          title="Access Denied" 
          message="You do not have permission to access this page. Please return to your dashboard."
        />
        <div className="flex justify-center mt-6">
          <Button onClick={handleGoBack} variant="default" className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
