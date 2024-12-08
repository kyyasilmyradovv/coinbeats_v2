// src/components/Sidebar.tsx

import React, { useState, useLayoutEffect } from 'react'
import { Page, Panel, Block, BlockTitle, List, ListItem, Radio, Toggle, Popover, Link, Button } from 'konsta/react'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../store/useUserStore'
import useAuthStore from '../store/useAuthStore'
import useSessionStore from '../store/useSessionStore'

const Sidebar: React.FC = () => {
    const navigate = useNavigate()
    const { roles, sidebarOpened, toggleSidebar, setUser } = useUserStore((state) => ({
        roles: state.roles,
        sidebarOpened: state.sidebarOpened,
        toggleSidebar: state.toggleSidebar,
        setUser: state.setUser
    }))

    const { theme, darkMode, setTheme, setColorTheme, setDarkMode } = useSessionStore((state) => ({
        theme: state.theme,
        darkMode: state.darkMode,
        setTheme: state.setTheme,
        setColorTheme: state.setColorTheme,
        setDarkMode: state.setDarkMode
    }))

    const [colorPickerOpened, setColorPickerOpened] = useState(false)

    useLayoutEffect(() => {
        setDarkMode(document.documentElement.classList.contains('dark'))
    }, [setDarkMode])

    const handleLogout = () => {
        useAuthStore.getState().logout() // Clear store and tokens
        useUserStore.getState().logoutUser() // Clear user state
        navigate('/login') // Redirect to login page
        toggleSidebar() // Close sidebar
    }

    const handleNavigation = (path: string) => {
        navigate(path)
        toggleSidebar() // Close sidebar after navigating
    }

    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode)
        toggleSidebar()
    }

    // Define role-based menu items
    const roleMenuItems = {
        SUPERADMIN: [
            { label: 'Dashboard', path: '/superadmin-dashboard' },
            { label: 'User Management', path: '/user-management' },
            { label: 'Academy Management', path: '/academy-management' },
            { label: 'Academy Statistics', path: '/academy-statistics' },
            { label: 'Academy Types', path: '/academy-types' },
            { label: 'Add Categories and Chains', path: '/add-categories-chains' },
            { label: 'Add Platform Tasks', path: '/add-platform-tasks' },
            { label: 'Inbox', path: '/inbox' },
            { label: 'Subscription Management', path: '/subscription-management' },
            { label: 'Scholarship Management', path: '/scholarship-management' },
            { label: 'Raffle Management', path: '/overall-raffle-management' },
            { label: 'Character Management', path: '/character-management' } // Added this line
        ],
        ADMIN: [
            { label: 'Admin Dashboard', path: '/admin-dashboard' },
            { label: 'User Management', path: '/user-management' },
            { label: 'Inbox', path: '/inbox' }
        ],
        CREATOR: [
            { label: 'Creator Dashboard', path: '/creator-dashboard' },
            { label: 'Create Academy', path: '/create-academy' },
            { label: 'Create Content', path: '/create-content' },
            { label: 'My Academies', path: '/my-academies' },
            { label: 'User Profile', path: '/user-profile' },
            { label: 'Academy Statistics', path: '/academy-statistics' },
            { label: 'Inbox', path: '/inbox' }
        ]
        // Add other roles if needed
    }

    const renderRoleBasedLinks = () => {
        if (!roles || roles.length === 0) {
            return null
        }

        const menuItems: Array<{ label: string; path: string }> = []

        roles.forEach((role) => {
            const items = roleMenuItems[role]
            if (items) {
                menuItems.push(...items)
            }
        })

        // Remove duplicates based on the path
        const uniqueMenuItems = Array.from(new Set(menuItems.map((item) => item.path))).map((path) => menuItems.find((item) => item.path === path))

        return (
            <>
                {uniqueMenuItems.map((item, index) => (
                    <Button key={index} raised rounded onClick={() => handleNavigation(item.path)}>
                        {item.label}
                    </Button>
                ))}
            </>
        )
    }

    return (
        <Panel side="right" floating opened={sidebarOpened} onBackdropClick={toggleSidebar}>
            <Page>
                <Block className="space-y-4">
                    <BlockTitle className="mb-1">Connect your TON Wallet</BlockTitle>
                    <TonConnectButton className="mx-auto" />

                    {/* <BlockTitle>Theme</BlockTitle>
                    <List strong inset>
                        <ListItem label title="iOS Theme" media={<Radio onChange={() => setTheme('ios')} component="div" checked={theme === 'ios'} />} />
                        <ListItem
                            label
                            title="Material Theme"
                            media={<Radio onChange={() => setTheme('material')} component="div" checked={theme === 'material'} />}
                        />
                    </List>

                    <List strong inset>
                        <ListItem title="Dark Mode" label after={<Toggle component="div" onChange={() => handleDarkModeToggle()} checked={darkMode} />} />
                        <ListItem
                            title="Color Theme"
                            link
                            onClick={() => setColorPickerOpened(true)}
                            after={<div className="w-6 h-6 rounded-full bg-primary home-color-picker" />}
                        />
                    </List>

                    <Popover
                        opened={colorPickerOpened}
                        onBackdropClick={() => setColorPickerOpened(false)}
                        size="w-36"
                        target=".home-color-picker"
                        className="transform translate-x-[-95%] translate-y-[-30%]"
                    >
                        <div className="grid grid-cols-3 py-2">
                            <Link
                                touchRipple
                                className="overflow-hidden h-12"
                                onClick={() => {
                                    setColorTheme('')
                                    setColorPickerOpened(false) // Close the popover
                                }}
                            >
                                <span className="bg-brand-primary w-6 h-6 rounded-full" />
                            </Link>
                            <Link
                                touchRipple
                                className="overflow-hidden h-12"
                                onClick={() => {
                                    setColorTheme('k-color-brand-red')
                                    setColorPickerOpened(false) // Close the popover
                                }}
                            >
                                <span className="bg-brand-red w-6 h-6 rounded-full" />
                            </Link>
                            <Link
                                touchRipple
                                className="overflow-hidden h-12"
                                onClick={() => {
                                    setColorTheme('k-color-brand-green')
                                    setColorPickerOpened(false) // Close the popover
                                }}
                            >
                                <span className="bg-brand-green w-6 h-6 rounded-full" />
                            </Link>
                            <Link
                                touchRipple
                                className="overflow-hidden h-12"
                                onClick={() => {
                                    setColorTheme('k-color-brand-yellow')
                                    setColorPickerOpened(false) // Close the popover
                                }}
                            >
                                <span className="bg-brand-yellow w-6 h-6 rounded-full" />
                            </Link>
                            <Link
                                touchRipple
                                className="overflow-hidden h-12"
                                onClick={() => {
                                    setColorTheme('k-color-brand-purple')
                                    setColorPickerOpened(false) // Close the popover
                                }}
                            >
                                <span className="bg-brand-purple w-6 h-6 rounded-full" />
                            </Link>
                        </div>
                    </Popover> */}

                    {/* Render role-based links */}
                    <Block className="space-y-2">{renderRoleBasedLinks()}</Block>

                    {/* Logout Button */}
                    <Button rounded outline onClick={handleLogout} className="!w-fit !px-4 !py-2 !mx-auto k-color-brand-red">
                        Logout
                    </Button>
                </Block>
            </Page>
        </Panel>
    )
}

export default Sidebar
