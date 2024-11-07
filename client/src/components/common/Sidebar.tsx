// client/src/components/common/Sidebar.tsx

import React, { useState, useLayoutEffect, useEffect, useRef } from 'react'
import { Page, Panel, Block, BlockTitle, List, ListInput, Button, Dialog, Notification, Popover } from 'konsta/react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/useUserStore'
import useSessionStore from '../../store/useSessionStore'
import Lottie from 'react-lottie'
import bunnyAnimationData from '../../animations/bunny.json'
import { TbBrandX } from 'react-icons/tb' // Import the X.com icon
// Removed axiosInstance import
// import axiosInstance from '../../api/axiosInstance'

const Sidebar: React.FC = () => {
    const navigate = useNavigate()

    const {
        roles,
        sidebarOpened,
        toggleSidebar,
        twitterAuthenticated,
        twitterUsername,
        setTwitterAuthenticated,
        setTwitterUserData,
        fetchTwitterAuthStatus,
        removeTwitterAccount,
        authenticated,
        telegramUserId // Add this line
    } = useUserStore((state) => ({
        roles: state.roles,
        sidebarOpened: state.sidebarOpened,
        toggleSidebar: state.toggleSidebar,
        twitterAuthenticated: state.twitterAuthenticated,
        twitterUsername: state.twitterUsername,
        setTwitterAuthenticated: state.setTwitterAuthenticated,
        setTwitterUserData: state.setTwitterUserData,
        fetchTwitterAuthStatus: state.fetchTwitterAuthStatus,
        removeTwitterAccount: state.removeTwitterAccount,
        authenticated: state.authenticated, // Add this line
        telegramUserId: state.telegramUserId?.toString() // Add this line
    }))

    const { erc20WalletAddress, solanaWalletAddress, tonWalletAddress, updateWalletAddresses } = useUserStore((state) => ({
        erc20WalletAddress: state.erc20WalletAddress,
        solanaWalletAddress: state.solanaWalletAddress,
        tonWalletAddress: state.tonWalletAddress,
        updateWalletAddresses: state.updateWalletAddresses
    }))

    const { darkMode, setDarkMode } = useSessionStore((state) => ({
        darkMode: state.darkMode,
        setDarkMode: state.setDarkMode
    }))

    const [walletDialogOpen, setWalletDialogOpen] = useState(false)
    const [walletAddresses, setWalletAddresses] = useState({
        erc20: erc20WalletAddress || '',
        solana: solanaWalletAddress || '',
        ton: tonWalletAddress || ''
    })

    useEffect(() => {
        setWalletAddresses({
            erc20: erc20WalletAddress || '',
            solana: solanaWalletAddress || '',
            ton: tonWalletAddress || ''
        })
    }, [erc20WalletAddress, solanaWalletAddress, tonWalletAddress])

    const bunnyAnimationOptions = {
        loop: true,
        autoplay: true,
        animationData: bunnyAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode)
        toggleSidebar()
    }

    useLayoutEffect(() => {
        setDarkMode(document.documentElement.classList.contains('dark'))
    }, [setDarkMode])

    const handleNavigation = (path: string) => {
        navigate(path)
        toggleSidebar()
    }

    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')

    const handleSaveWalletAddresses = async () => {
        try {
            await updateWalletAddresses({
                erc20WalletAddress: walletAddresses.erc20,
                solanaWalletAddress: walletAddresses.solana,
                tonWalletAddress: walletAddresses.ton
            })
            setWalletDialogOpen(false)

            // Show success notification
            setNotificationText('You have successfully added your wallet addresses')
            setNotificationOpen(true)
        } catch (error) {
            console.error('Error saving wallet addresses:', error)

            // Optionally, show an error notification
            setNotificationText('Failed to add your wallet addresses. Please try again.')
            setNotificationOpen(true)
        }
    }

    const renderRoleBasedButtons = () => {
        const buttons = []

        const buttonStyle = {
            background: 'linear-gradient(to left, #ff0077, #7700ff)',
            color: '#fff',
            borderColor: '#9c27b0'
        }

        if (roles.includes('SUPERADMIN')) {
            buttons.push(
                <Button
                    key="superadmin"
                    rounded
                    outline
                    onClick={() => handleNavigation('/superadmin-dashboard')}
                    className="!w-full !px-4 !py-2 !mx-auto !text-[13px]"
                    style={buttonStyle}
                >
                    Log in as Superadmin
                </Button>
            )
        }
        if (roles.includes('ADMIN')) {
            buttons.push(
                <Button
                    key="admin"
                    rounded
                    outline
                    onClick={() => handleNavigation('/admin-dashboard')}
                    className="!w-full !px-4 !py-2 !mx-auto !text-[13px]"
                    style={buttonStyle}
                >
                    Log in as Admin
                </Button>
            )
        }
        if (roles.includes('CREATOR')) {
            buttons.push(
                <Button
                    key="creator"
                    rounded
                    outline
                    onClick={() => handleNavigation('/creator-dashboard')}
                    className="!w-full !px-4 !py-2 !mx-auto !text-[13px]"
                    style={buttonStyle}
                >
                    Log in as Creator
                </Button>
            )
        }
        if (roles.includes('USER') && !roles.includes('CREATOR')) {
            buttons.push(
                <Button
                    key="become-creator"
                    rounded
                    outline
                    onClick={() => handleNavigation('/register-creator')}
                    className="!w-full !px-4 !py-2 !mx-auto !text-[13px] !whitespace-nowrap"
                    style={buttonStyle}
                >
                    Become Academy Creator
                </Button>
            )
        }

        return buttons
    }

    // Popover state
    const [popoverOpen, setPopoverOpen] = useState(false)
    const popoverTargetRef = useRef<HTMLButtonElement>(null)

    // Function to handle authentication
    const handleAuthenticate = () => {
        if (!authenticated || !telegramUserId) {
            setNotificationText('Please log in to authenticate with X.')
            setNotificationOpen(true)
            return
        }

        const returnTo = encodeURIComponent(window.location.href)
        const authUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/twitter/start?returnTo=${returnTo}&telegramUserId=${telegramUserId}`

        window.open(authUrl, '_blank')
        setPopoverOpen(false)
    }

    // Function to handle removal of Twitter account
    const handleRemoveTwitterAccount = async () => {
        const message = await removeTwitterAccount()
        setNotificationText(message)
        setNotificationOpen(true)
        setPopoverOpen(false)
    }

    // Fetch Twitter authentication status
    useEffect(() => {
        const fetchTwitterStatus = async () => {
            try {
                await fetchTwitterAuthStatus()
            } catch (error) {
                console.error('Error fetching Twitter status:', error)
            }
        }

        fetchTwitterStatus()
    }, [fetchTwitterAuthStatus])

    // Handle Twitter authentication callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const twitterAuthStatus = urlParams.get('twitterAuth')
        if (twitterAuthStatus === 'success') {
            setTwitterAuthenticated(true)
            setNotificationText('X authentication successful!')
            setNotificationOpen(true)
            // Remove the query parameter from the URL
            navigate('', { replace: true })
        } else if (twitterAuthStatus === 'failure') {
            setNotificationText('X authentication failed. Please try again.')
            setNotificationOpen(true)
            navigate('', { replace: true })
        }
    }, [setTwitterAuthenticated, navigate])

    return (
        <Panel side="right" floating opened={sidebarOpened} onBackdropClick={toggleSidebar}>
            <Page className="flex flex-col h-full">
                <Block className="space-y-4 flex-grow !items-center  !flex !flex-col">
                    <BlockTitle className="!text-center mb-1 !m-0 !p-0">Your Wallet</BlockTitle>
                    {/* <TonConnectButton className="mx-auto" /> */}

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg m-0 tab-background mb-4 cursor-pointer"
                        onClick={() => setWalletDialogOpen(true)}
                    >
                        <div className="relative z-10 m-[2px] rounded-2xl tab-content p-4">
                            <div className="text-white text-center">
                                <h2 className="text-lg font-bold mb-2">Where will we distribute rewards?</h2>
                                <p className="text-sm">Add wallet addresses!</p>
                            </div>
                        </div>
                    </div>

                    {/* Authenticated X User */}
                    <BlockTitle className="!text-center !mt-10">Authenticated X User</BlockTitle>
                    <div className="flex justify-center relative">
                        {/* Custom Twitter Button */}
                        <button
                            ref={popoverTargetRef}
                            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
                            onClick={() => {
                                setPopoverOpen(true)
                            }}
                        >
                            <TbBrandX className="w-5 h-5" />
                            <span className="text-sm">{twitterAuthenticated ? `@${twitterUsername}` : 'Authenticate with X'}</span>
                        </button>

                        {/* Popover */}
                        <Popover
                            opened={popoverOpen}
                            target={popoverTargetRef.current}
                            onBackdropClick={() => setPopoverOpen(false)}
                            size="w-56"
                            className="right-0"
                            style={{ transform: 'translateX(-50%)' }}
                        >
                            <Block>
                                {twitterAuthenticated ? (
                                    <button
                                        className="w-full px-4 py-2 rounded-full bg-red-500 text-white font-semibold shadow-md hover:bg-red-600 transition-colors"
                                        onClick={handleRemoveTwitterAccount}
                                    >
                                        Remove X User
                                    </button>
                                ) : (
                                    <button
                                        className="w-full px-4 py-2 rounded-full bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 transition-colors"
                                        onClick={handleAuthenticate}
                                    >
                                        Authenticate
                                    </button>
                                )}
                            </Block>
                        </Popover>
                    </div>
                </Block>

                {/* Move role-based buttons to the bottom */}
                <Block className="space-y-2 mb-20">{renderRoleBasedButtons()}</Block>

                {/* Wallet Addresses Dialog */}
                <Dialog opened={walletDialogOpen} onBackdropClick={() => setWalletDialogOpen(false)} className="!m-0 !p-0 !rounded-2xl !bg-opacity-80">
                    <div className="p-0 relative">
                        {/* Close Button */}
                        <button className="absolute right-1 text-gray-500 hover:text-gray-700" onClick={() => setWalletDialogOpen(false)}>
                            &times;
                        </button>
                        {/* Bunny Animation */}
                        <div className="flex items-center justify-center mb-4">
                            <Lottie options={bunnyAnimationOptions} height={150} width={150} />
                        </div>
                        {/* Heading */}
                        <div className="text-md font-bold text-center mt-4">Add wallet addresses</div>
                        {/* Text */}
                        <p className="text-center mt-2 px-4">Add your wallet addresses for potential reward distributions:</p>
                        {/* Input Fields */}
                        <List className="!m-0 !p-4">
                            <ListInput
                                outline
                                label="ERC-20"
                                placeholder="Enter your ERC-20 address"
                                value={walletAddresses.erc20}
                                onChange={(e) => setWalletAddresses({ ...walletAddresses, erc20: e.target.value })}
                            />
                            <ListInput
                                outline
                                label="Solana"
                                placeholder="Enter your Solana address"
                                value={walletAddresses.solana}
                                onChange={(e) => setWalletAddresses({ ...walletAddresses, solana: e.target.value })}
                            />
                            <ListInput
                                outline
                                label="TON"
                                placeholder="Enter your TON address"
                                value={walletAddresses.ton}
                                onChange={(e) => setWalletAddresses({ ...walletAddresses, ton: e.target.value })}
                            />
                        </List>
                        {/* Save Button */}
                        <div className="flex justify-center mt-4 mb-4">
                            <Button
                                outline
                                rounded
                                onClick={handleSaveWalletAddresses}
                                className="!text-xs mt-4 font-bold shadow-xl min-w-28 !mx-auto !h-7"
                                style={{
                                    background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                    color: '#fff',
                                    borderColor: '#9c27b0'
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </Dialog>

                {/* Success Notification */}
                <Notification
                    className="fixed top-12 left-0 z-50 border"
                    opened={notificationOpen}
                    title="Message"
                    text={notificationText}
                    button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                    onClose={() => setNotificationOpen(false)}
                />
            </Page>
        </Panel>
    )
}

export default Sidebar
