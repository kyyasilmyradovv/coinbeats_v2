import React, { useState, useLayoutEffect } from 'react'
import { Page, Panel, Block, BlockTitle, List, ListItem, Radio, Toggle, Popover, Link, Button } from 'konsta/react'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../store/useUserStore'
import useAuthStore from '../store/useAuthStore'
import useSessionStore from '../store/useSessionStore'

const Sidebar: React.FC = () => {
    const navigate = useNavigate()
    const { role, sidebarOpened, toggleSidebar, setUser } = useUserStore((state) => ({
        role: state.role,
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

    const renderRoleBasedLinks = () => {
        switch (role) {
            case 'SUPERADMIN':
                return (
                    <>
                        <Button raised rounded onClick={() => handleNavigation('/superadmin-dashboard')}>
                            Dashboard
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/user-management')}>
                            User Management
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/academy-statistics')}>
                            Academy Statistics
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/academy-types')}>
                            Academy types
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/add-categories-chains')}>
                            Add categories and chains
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/add-platform-tasks')}>
                            Add platform tasks
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/inbox')}>
                            Inbox
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/subscription-management')}>
                            Subscription Management
                        </Button>
                    </>
                )
            case 'ADMIN':
                return (
                    <>
                        <Button raised rounded onClick={() => handleNavigation('/admin-dashboard')}>
                            Admin Dashboard
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/user-management')}>
                            User Management
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/inbox')}>
                            Inbox
                        </Button>
                    </>
                )
            case 'CREATOR':
                return (
                    <>
                        <Button raised rounded onClick={() => handleNavigation('/creator-dashboard')}>
                            Creator Dashboard
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/create-academy')}>
                            Create Academy
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/my-academies')}>
                            My Academies
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/user-profile')}>
                            User Profile
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/academy-statistics')}>
                            Academy Statistics
                        </Button>
                        <Button raised rounded onClick={() => handleNavigation('/inbox')}>
                            Inbox
                        </Button>
                    </>
                )
            default:
                return null // Other roles or default case
        }
    }

    return (
        <Panel side="right" floating opened={sidebarOpened} onBackdropClick={toggleSidebar}>
            <Page>
                <Block className="space-y-4">
                    <BlockTitle className="mb-1">Connect your TON Wallet</BlockTitle>
                    <TonConnectButton className="mx-auto" />

                    <BlockTitle>Theme</BlockTitle>
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
                    </Popover>

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
