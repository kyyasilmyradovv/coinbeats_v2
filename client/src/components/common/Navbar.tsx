// client/src/components/common/Navbar.tsx

import React, { useMemo } from 'react'
import { useInitData } from '@telegram-apps/sdk-react'
import { useNavigate } from 'react-router-dom'
import { Chip, NavbarBackLink, Navbar as KonstaNavbar } from 'konsta/react'
import logoLight from '../../images/coinbeats-light.svg'
import logoDark from '../../images/coinbeats-dark.svg'
import avatar from '../../images/bunny-head.png'
import useUserStore from '../../store/useUserStore'
import useSessionStore from '../../store/useSessionStore'

interface NavbarProps {
    handleNavigationAttempt?: (newFilter: string | null, navigationAction: () => void) => void
}

const Navbar: React.FC<NavbarProps> = ({ handleNavigationAttempt }) => {
    const initData = useInitData()
    const navigate = useNavigate()
    const { toggleSidebar, username } = useUserStore((state) => ({
        toggleSidebar: state.toggleSidebar,
        username: state.username
    }))

    const { darkMode } = useSessionStore((state) => ({ darkMode: state.darkMode }))

    const userAvatar = useMemo(() => initData?.user?.photo_url || `${avatar}`, [initData])

    const canGoBack = window.history.length > 1

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault()
        const navigationAction = () => {
            navigate('/')
        }
        if (handleNavigationAttempt) {
            handleNavigationAttempt(null, navigationAction)
        } else {
            navigationAction()
        }
    }

    return (
        <KonstaNavbar
            title={
                <a href="/" onClick={handleLogoClick}>
                    <img src={darkMode ? logoLight : logoDark} alt="Company Logo" className="h-7 mx-auto" />
                </a>
            }
            className="top-0 sticky"
            left={canGoBack ? <NavbarBackLink onClick={() => navigate(-1)} /> : null}
            right={
                <Chip
                    className="m-0.5 !pr-1"
                    media={<img alt="avatar" className="ios:h-7 material:h-6 rounded-full" src={userAvatar} />}
                    onClick={toggleSidebar}
                >
                    <p className="truncate max-w-[60px]">{username}</p>
                </Chip>
            }
            centerTitle={true}
        />
    )
}

export default Navbar
