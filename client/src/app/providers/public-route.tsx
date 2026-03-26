import { useAuth } from '@features/auth/model/auth-context';
import { Navigate, Outlet } from 'react-router-dom';

export function PublicRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white px-4 py-8 text-center text-neutral-600">
        Loading session
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
