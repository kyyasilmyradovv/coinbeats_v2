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

    console.log('Access Token:', accessToken)
    console.log('User Roles:', userRoles)

    if (!accessToken) {
        console.warn('No access token, redirecting to login')
        return <Navigate to="/login" replace />
    }

    if (requiredRole && !userRoles.includes(requiredRole)) {
        console.warn(`User lacks role: ${requiredRole}. Roles are: ${userRoles}`)
        return <Navigate to="/not-authorized" replace />
    }

    return children
}

export default RouteGuard
