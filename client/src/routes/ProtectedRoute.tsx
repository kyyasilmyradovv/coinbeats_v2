// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Route, Navigate, RouteProps } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

interface ProtectedRouteProps extends RouteProps {
  allowedRoles: string[];
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, element, ...rest }) => {
  const { userRole, accessToken } = useAuthStore();

  if (!accessToken || !allowedRoles.includes(userRole || '')) {
    return <Navigate to="/login" replace />;
  }

  return <Route {...rest} element={element} />;
};

export default ProtectedRoute;
