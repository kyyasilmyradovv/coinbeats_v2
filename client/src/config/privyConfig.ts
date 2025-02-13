import type { PrivyClientConfig } from '@privy-io/react-auth'

export function getPrivyConfig(theme: 'dark' | 'light'): PrivyClientConfig {
    return {
        embeddedWallets: {
            createOnLogin: 'off',
            requireUserPasswordOnCreate: true,
            showWalletUIs: true
        },
        loginMethods: ['telegram'],
        appearance: {
            showWalletLoginFirst: true,
            theme,
            accentColor: '#4c4c4c',
            logo: '../../images/coinbeats-l.svg'
        },
        fundingMethodConfig: {
            moonpay: {
                paymentMethod: 'credit_debit_card',
                uiConfig: {
                    accentColor: '#696FFD',
                    theme
                }
            }
        }
    }
}
