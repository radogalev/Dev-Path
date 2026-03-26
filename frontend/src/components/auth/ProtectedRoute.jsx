import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const hasStoredUser = Boolean(localStorage.getItem('user'));

  if (!isAuthenticated || !hasStoredUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
