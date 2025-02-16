// client/src/index.tsx

import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import IntroPage from './components/IntroPage'
import MaintenancePage from './components/MaintenancePage'
import * as serviceWorker from './serviceWorker'
import { SDKProvider } from '@telegram-apps/sdk-react'
import { wagmiConfig } from './config/wagmiConfig.js'
import { WagmiProvider } from 'wagmi'
import { PrivyProvider } from '@privy-io/react-auth'
import { getPrivyConfig as basePrivyConfig } from './config/privyConfig'

// Initialize dark mode settings
const darkModeSetting = localStorage.getItem('darkMode')
const darkMode = darkModeSetting !== 'false' // Default to true unless explicitly set to 'false'

if (darkMode) {
    document.documentElement.classList.add('dark')
} else {
    document.documentElement.classList.remove('dark')
}

const root = createRoot(document.getElementById('root')!)

const MAINTENANCE_MODE = false

const Index = () => {
    useEffect(() => {
        // Remove the spinner if it exists
        const spinner = document.getElementById('initial-spinner')
        if (spinner) {
            spinner.remove()
        }
    }, [])

    if (MAINTENANCE_MODE) {
        return (
            <React.StrictMode>
                <MaintenancePage />
            </React.StrictMode>
        )
    }

    // If not in maintenance mode, show the normal intro -> app flow
    const [showIntro, setShowIntro] = React.useState(true)
    const handleIntroComplete = () => {
        setShowIntro(false)
    }

    const dynamicPrivyConfig = useMemo(() => {
        // Call the basePrivyConfig function with the current theme to get the config object
        const baseConfig = basePrivyConfig('dark')

        return {
            ...baseConfig,
            autoLogin: true,
            embeddedWallets: {
                createOnLogin: 'users-without-wallets'
            },
            appearance: {
                ...(baseConfig.appearance ?? {}),
                theme: 'dark'
            }
            // fundingMethodConfig: {
            //     ...(baseConfig.fundingMethodConfig ?? {}),
            //     moonpay: {
            //         ...(baseConfig.fundingMethodConfig?.moonpay ?? {}),
            //         uiConfig: {
            //             ...(baseConfig.fundingMethodConfig?.moonpay?.uiConfig ?? {}),
            //             theme: 'dark'
            //         }
            //     }
            // }
        }
    }, [])

    return (
        <React.StrictMode>
            <SDKProvider>
                <PrivyProvider appId="cm71yn23l026rpz7ps7rrfhqn" config={dynamicPrivyConfig}>
                    <WagmiProvider config={wagmiConfig}>
                        <Router>{showIntro ? <IntroPage onComplete={handleIntroComplete} /> : <App />}</Router>
                    </WagmiProvider>
                </PrivyProvider>
            </SDKProvider>
        </React.StrictMode>
    )
}

root.render(<Index />)

serviceWorker.unregister()
