// client/src/components/common/Sidebar.tsx

import React, { useState, useLayoutEffect, useEffect } from 'react'
import { Page, Panel, Block, BlockTitle, List, ListInput, Button, Dialog, Notification } from 'konsta/react'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/useUserStore'
import useSessionStore from '../../store/useSessionStore'
import Lottie from 'react-lottie'
import bunnyAnimationData from '../../animations/bunny.json'

const Sidebar: React.FC = () => {
    const navigate = useNavigate()

    const { roles, sidebarOpened, toggleSidebar } = useUserStore((state) => ({
        roles: state.roles,
        sidebarOpened: state.sidebarOpened,
        toggleSidebar: state.toggleSidebar
    }))

    const { erc20WalletAddress, solanaWalletAddress, tonWalletAddress, updateWalletAddresses } = useUserStore((state) => ({
        erc20WalletAddress: state.erc20WalletAddress,
        solanaWalletAddress: state.solanaWalletAddress,
        tonWalletAddress: state.tonWalletAddress,
        updateWalletAddresses: state.updateWalletAddresses
    }))

    const { theme, darkMode, setTheme, setColorTheme, setDarkMode } = useSessionStore((state) => ({
        theme: state.theme,
        darkMode: state.darkMode,
        setTheme: state.setTheme,
        setColorTheme: state.setColorTheme,
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

    return (
        <Panel side="right" floating opened={sidebarOpened} onBackdropClick={toggleSidebar}>
            <Page>
                <Block className="space-y-4">
                    <BlockTitle className="mb-1">Connect your TON Wallet</BlockTitle>
                    <TonConnectButton className="mx-auto" />

                    <Block className="space-y-2">{renderRoleBasedButtons()}</Block>

                    {/* New Banner with Flashy Design */}
                    <Block>
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
                    </Block>

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
                        title="Success"
                        text={notificationText}
                        button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                        onClose={() => setNotificationOpen(false)}
                    />
                </Block>
            </Page>
        </Panel>
    )
}

export default Sidebar
