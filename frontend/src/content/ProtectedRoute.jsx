import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  // 1. If not logged in, kick them to the login screen
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // 2. Role-based access control (RBAC)
  if (requiredRole) {
    // Convert to array if a single string was passed (e.g., requiredRole="student")
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // If the user's role is not in the allowed list, kick them to unauthorized
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />; 
    }
  } 
  
  // 3. If everything passes, render the protected component
  return children;
};

export default ProtectedRoute;