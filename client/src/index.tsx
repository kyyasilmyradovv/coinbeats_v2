// client/src/index.tsx

import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import IntroPage from './components/IntroPage'
import * as serviceWorker from './serviceWorker'

const darkMode = localStorage.getItem('darkMode') === 'true'
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
            <Router>
                {/* Display IntroPage until the intro is done */}
                {showIntro ? <IntroPage onComplete={handleIntroComplete} /> : <App />}
            </Router>
        </React.StrictMode>
    )
}

root.render(<Index />)

serviceWorker.unregister()
