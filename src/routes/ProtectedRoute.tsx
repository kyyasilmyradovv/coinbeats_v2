// src/routes/ProtectedRoute.tsx

import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles: string[];
  path: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles, path }) => {
  const { role, authenticated } = useUserStore((state) => ({
    role: state.role,
    authenticated: state.authenticated,
  }));

  if (!authenticated || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Route path={path} element={element} />;
};

export default ProtectedRoute;
