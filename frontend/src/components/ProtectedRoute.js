
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  // if not authenticated, redirect back to login page
  // otherwise, return the current page that user wants to go to
  if (!isAuthenticated) return <Navigate replace to="/login" />;
  return children;
};

export default ProtectedRoute;
