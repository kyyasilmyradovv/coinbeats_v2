// src/App.tsx

import React from 'react'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import RootComponent from './RootComponent'

import './index.css'
import './mockEnv'

const manifestUrl = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json'

const App: React.FC = () => {
    return (
        <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
            <RootComponent />
        </TonConnectUIProvider>
    )
}

export default App
