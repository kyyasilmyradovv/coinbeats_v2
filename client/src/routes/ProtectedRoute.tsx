// src/routes/ProtectedRoute.tsx
import React from 'react'
import { Route, Navigate, RouteProps } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

interface ProtectedRouteProps extends RouteProps {
    allowedRoles: string[]
    element: React.ReactElement
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, element, ...rest }) => {
    const { userRoles, accessToken } = useAuthStore()

    if (!accessToken || !userRoles.some((role) => allowedRoles.includes(role))) {
        return <Navigate to="/login" replace />
    }

    return <Route {...rest} element={element} />
}

export default ProtectedRoute
