import { Navigate } from 'react-router-dom';

const AdminRoute = ({ user, userRole, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
