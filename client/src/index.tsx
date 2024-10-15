// client/src/index.tsx

import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import IntroPage from './components/IntroPage'
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

const Index = () => {
    const [showIntro, setShowIntro] = useState(true) // Control intro visibility

    // Once the intro completes, show the main app
    const handleIntroComplete = () => {
        setShowIntro(false)
    }

    return (
        <React.StrictMode>
            <SDKProvider>
                <Router>
                    {/* Display IntroPage until the intro is done */}
                    {showIntro ? <IntroPage onComplete={handleIntroComplete} /> : <App />}
                </Router>
            </SDKProvider>
        </React.StrictMode>
    )
}

root.render(<Index />)

serviceWorker.unregister()
