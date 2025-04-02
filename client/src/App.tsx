// src/App.tsx

import React from 'react'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import RootComponent from './RootComponent'
import { ThirdwebProvider } from 'thirdweb/react'

import './index.css'
import './mockEnv'

const manifestUrl = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json'

const App: React.FC = () => {
    return (
        <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
            <ThirdwebProvider>
                <RootComponent />
            </ThirdwebProvider>
        </TonConnectUIProvider>
    )
}

export default App
