import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { createRoot } from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { SDKProvider } from '@telegram-apps/sdk-react';
import RootComponent from './RootComponent'
import { persistor, store } from './store/reducers/store'

import './index.css';
import './mockEnv';

const manifestUrl =
  'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json';

const App: React.FC = () => {
    return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
        <SDKProvider>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <RootComponent />
                </PersistGate>
            </Provider>
        </SDKProvider>
    </TonConnectUIProvider>
    )
}

export default App
