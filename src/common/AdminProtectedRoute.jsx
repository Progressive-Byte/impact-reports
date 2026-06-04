import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E52321] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return admin ? children : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;
