import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from './context/AdminAuthContext';

/**
 * 🔐 AdminRoute (Protected Route Wrapper)
 * ======================================
 * Protects admin routes from unauthorized access
 *
 * FLOW:
 * 1. Check loading state
 * 2. Check if admin is authenticated
 * 3. If not → redirect to /admin-login
 * 4. If yes → render children
 *
 * NOTE:
 * - Backend token verification happens in AdminOnlyLayout
 * - This component only handles frontend protection
 */

const AdminRoute = () => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{ display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', 
        height:'100vh' }}>
        <p>Verifying access...</p>
      </div>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/admin-login" state={{ from: window.location.pathname }} replace />;
};

export default AdminRoute;
