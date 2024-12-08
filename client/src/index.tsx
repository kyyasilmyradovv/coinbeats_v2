// client/src/index.tsx

import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import IntroPage from './components/IntroPage'
import MaintenancePage from './components/MaintenancePage'
import * as serviceWorker from './serviceWorker'
import { SDKProvider } from '@telegram-apps/sdk-react'

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
    const [showIntro, setShowIntro] = useState(true)

    useEffect(() => {
        // Remove the spinner if it exists
        const spinner = document.getElementById('initial-spinner')
        if (spinner) {
            spinner.remove()
        }

        // Initialize TappAds SDK
        if (typeof TappAdsAdvSdk !== 'undefined') {
            TappAdsAdvSdk.init('0f851f3d-2778-4dc1-9a4e-f10597e1065f', { debug: true })
                .then(() => {
                    console.log('TappAdsAdvSdk initialized successfully')
                })
                .catch((err) => {
                    console.error('Error initializing TappAdsAdvSdk:', err)
                })
        } else {
            console.error('TappAdsAdvSdk is not loaded.')
        }
    }, [])

    const handleIntroComplete = () => {
        setShowIntro(false)
    }

    if (MAINTENANCE_MODE) {
        return (
            <React.StrictMode>
                <MaintenancePage />
            </React.StrictMode>
        )
    }

    return (
        <React.StrictMode>
            <SDKProvider>
                <Router>{showIntro ? <IntroPage onComplete={handleIntroComplete} /> : <App />}</Router>
            </SDKProvider>
        </React.StrictMode>
    )
}

root.render(<Index />)

serviceWorker.unregister()
