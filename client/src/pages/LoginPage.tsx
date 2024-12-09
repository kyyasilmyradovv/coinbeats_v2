import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, List, ListInput, Button, BlockTitle, Block, Notification } from 'konsta/react'
import { Icon } from '@iconify/react'
import useAuthStore from '../store/useAuthStore'
import useUserStore from '../store/useUserStore'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'

// Define role priority for determining the highest role
const rolePriority = {
    SUPERADMIN: 4,
    ADMIN: 3,
    CREATOR: 2,
    USER: 1
}

// Function to get the highest role based on the priority
const getHighestRole = (roles: (keyof typeof rolePriority)[]): keyof typeof rolePriority => {
    return roles.reduce((highest, role) => (rolePriority[role] > rolePriority[highest] ? role : highest), roles[0])
}

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const navigate = useNavigate()

    const { login, initializeAuth, accessToken, userRoles, setUserRoles } = useAuthStore((state) => ({
        login: state.login,
        initializeAuth: state.initializeAuth,
        accessToken: state.accessToken,
        userRoles: state.userRoles as (keyof typeof rolePriority)[], // Type assertion
        setUserRoles: state.setUserRoles
    }))

    const { hasAcademy, emailConfirmed } = useUserStore((state) => ({
        hasAcademy: state.hasAcademy,
        emailConfirmed: state.emailConfirmed
    }))

    // Initialize authentication state on component mount
    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

    // Redirect user based on roles if already logged in
    useEffect(() => {
        if (accessToken && userRoles.length > 0) {
            const highestRole = getHighestRole(userRoles)

            if (highestRole === 'SUPERADMIN') {
                navigate('/superadmin-dashboard')
            } else if (highestRole === 'ADMIN') {
                navigate('/admin-dashboard')
            } else if (highestRole === 'CREATOR') {
                navigate(hasAcademy ? '/creator-dashboard' : '/create-academy')
            } else {
                navigate('/') // Default route for USER
            }
        }
    }, [accessToken, userRoles, navigate, hasAcademy])

    // Handle login submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setNotificationOpen(false)

        try {
            const roles = await login(email, password)

            if (!emailConfirmed) {
                setNotificationText('Please confirm your email before logging in.')
                setNotificationOpen(true)
                return
            }

            // Navigate after roles are updated
            const highestRole = getHighestRole(roles)
            if (highestRole === 'SUPERADMIN') {
                navigate('/superadmin-dashboard')
            } else if (highestRole === 'ADMIN') {
                navigate('/admin-dashboard')
            } else if (highestRole === 'CREATOR') {
                navigate(hasAcademy ? '/creator-dashboard' : '/create-academy')
            } else {
                navigate('/')
            }
        } catch (error: any) {
            console.error('Login failed:', error)
            setNotificationText('Login failed. Please try again.')
            setNotificationOpen(true)
        }
    }

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="text-center flex w-full items-center justify-center top-8 mb-10">
                <BlockTitle large>Login</BlockTitle>
            </div>

            <Block strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <List className="rounded-2xl">
                        <ListInput
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            outline
                            clearButton
                            required
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onClear={() => setEmail('')}
                            className="rounded-2xl"
                        />
                        <ListInput
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            outline
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="rounded-2xl"
                            inputClassName="pr-12"
                        >
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-4 top-14 px-3 flex items-center text-gray-500 focus:outline-none"
                            >
                                <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-closed'} width="20" height="20" />
                            </button>
                        </ListInput>
                    </List>
                    <Button type="submit" large raised strong className="w-full rounded-2xl">
                        Login
                    </Button>
                </form>
            </Block>

            {/* Notification Element */}
            <Notification
                opened={notificationOpen}
                title="Message"
                text={notificationText}
                button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                onClose={() => setNotificationOpen(false)}
            />
        </Page>
    )
}

export default LoginPage
