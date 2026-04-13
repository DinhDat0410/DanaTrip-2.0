import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminHomeRedirect = () => {
  const { user } = useAuth();

  if (user?.vaiTro === 'Admin') {
    return <Navigate to="/admin/users" replace />;
  }

  if (user?.vaiTro === 'Partner') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminHomeRedirect;
