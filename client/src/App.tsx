import React, { useEffect } from 'react'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import RootComponent from './RootComponent'
import './index.css'
import './mockEnv'

const manifestUrl = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json'

declare const TappAdsAdvSdk: any

const App: React.FC = () => {
    useEffect(() => {
        // Initialize TappAds SDK
        if (typeof TappAdsAdvSdk !== 'undefined') {
            TappAdsAdvSdk.init('0f851f3d-2778-4dc1-9a4e-f10597e1065f', { debug: true })
                .then(() => {
                    console.log('TappAdsAdvSdk initialized successfully')
                })
                .catch((err: unknown) => {
                    console.error('Error initializing TappAdsAdvSdk:', err)
                })
        } else {
            console.error('TappAdsAdvSdk is not loaded.')
        }
    }, [])

    return (
        <TonConnectUIProvider manifestUrl={manifestUrl}>
            <RootComponent />
        </TonConnectUIProvider>
    )
}

export default App
