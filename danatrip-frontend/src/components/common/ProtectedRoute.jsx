import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from './Loading';

const ProtectedRoute = ({ children, adminOnly = false, allowedRoles = [] }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  if (loading) return <Loading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const rolesToCheck = adminOnly ? ['Admin'] : allowedRoles;

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(user?.vaiTro)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
