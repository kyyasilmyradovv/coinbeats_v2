// src/components/RouteGuard.tsx

import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

interface RouteGuardProps {
    children: JSX.Element
    requiredRole?: string // Optional role requirement
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, requiredRole }) => {
    const { accessToken, userRoles } = useAuthStore((state) => ({
        accessToken: state.accessToken,
        userRoles: state.userRoles
    }))

    if (!accessToken) {
        // User is not authenticated, redirect to login page
        return <Navigate to="/login" replace />
    }

    if (requiredRole && !userRoles.includes(requiredRole)) {
        // User is authenticated but does not have the required role
        console.log(`User roles are ${userRoles.join(', ')}, but required role is ${requiredRole}`)
        return <Navigate to="/not-authorized" replace />
    }

    // User is authenticated and authorized
    return children
}

export default RouteGuard
