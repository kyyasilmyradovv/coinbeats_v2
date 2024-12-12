// src/components/RouteGuard.tsx

import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

interface RouteGuardProps {
    children: JSX.Element
    allowedRoles?: string[] // Now this is an array of allowed roles
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
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

    if (allowedRoles && allowedRoles.length > 0) {
        // Check if the user has at least one of the allowed roles
        const hasRole = allowedRoles.some((role) => userRoles.includes(role))
        if (!hasRole) {
            console.warn(`User lacks any of the required roles: ${allowedRoles.join(', ')}. User Roles are: ${userRoles}`)
            return <Navigate to="/not-authorized" replace />
        }
    }

    return children
}

export default RouteGuard
