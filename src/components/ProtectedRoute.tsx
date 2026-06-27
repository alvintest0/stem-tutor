import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { currentUser, emailVerified } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}
