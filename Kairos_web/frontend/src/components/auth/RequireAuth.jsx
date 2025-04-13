import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/signin" replace />;
};