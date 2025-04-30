'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Wallet, ExternalLink, ChevronDown, ChevronUp, X } from 'lucide-react'
import { client } from '../../client'
import { ethereum } from 'thirdweb/chains'
import { ConnectButton, useActiveAccount, useWalletBalance, useActiveWallet } from 'thirdweb/react'
import { useTheme } from 'next-themes'

export default function WalletSidebar({ onClose }: { onClose?: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const { theme } = useTheme()
    const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark')

    // Update theme when it changes
    useEffect(() => {
        setCurrentTheme(theme === 'dark' ? 'dark' : 'light')
    }, [theme])

    // ThirdWeb hooks
    const account = useActiveAccount()
    const wallet = useActiveWallet()
    const { data: balance, isLoading: isBalanceLoading } = useWalletBalance({
        client,
        chain: ethereum,
        address: account?.address
    })

    // Get current network/chain info
    const chain = wallet?.getChain()

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded)
    }

    const getExplorerUrl = () => {
        if (!account?.address) return ''
        let baseUrl = 'https://etherscan.io'
        if (chain?.name && chain.name.toLowerCase() !== 'ethereum') {
            baseUrl = `https://${chain.name.toLowerCase()}.etherscan.io`
        }
        return `${baseUrl}/address/${account.address}`
    }

    if (!account) {
        return (
            <div className="h-full w-full flex flex-col bg-background border-l">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center">
                        <Wallet className="mr-2 h-5 w-5 text-primary" />
                        <h2 className="text-lg font-medium">Connect Wallet</h2>
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-6">
                        Connect your wallet to access personalized AI responses for your Web3 assets and transactions.
                    </p>

                    <div className="flex-1 flex flex-col justify-center items-center gap-4">
                        <ConnectButton client={client} theme={currentTheme} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col bg-background border-l">
            <div className="flex items-center justify-between px-4 pb-2">
                <div className="flex items-center">
                    <Wallet className="mr-2 h-4 w-4" />
                    <h2 className="text-md font-medium">My Wallet</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Wallet Address Card */}
                <Card className="p-4 border bg-card">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex-1 mr-2">
                            <ConnectButton client={client} theme={currentTheme} />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 flex-shrink-0 transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                            title="View on Etherscan"
                            asChild
                        >
                            <a href={getExplorerUrl()} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </Card>

                {/* Balance Card */}
                <Card className="overflow-hidden border">
                    <div className="p-3 flex items-center justify-between bg-muted/30">
                        <h3 className="text-sm font-medium">Balance</h3>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleExpanded}>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Main Balance Always Visible */}
                    <div className="p-4 bg-card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                    {chain?.nativeCurrency?.symbol?.slice(0, 1) || 'Ξ'}
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{chain?.nativeCurrency?.symbol || 'ETH'}</div>
                                </div>
                            </div>
                            {isBalanceLoading ? (
                                <div className="h-5 w-16 bg-muted/50 rounded animate-pulse"></div>
                            ) : (
                                <div className="text-right">
                                    <div className="text-sm font-medium">{balance?.displayValue || '0'}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && <div className="border-t p-3 text-center text-sm bg-muted/10">Ask the AI: "Analyze my ETH holdings"</div>}
                </Card>

                {/* Enhanced Network Info Section */}
                <Card className="p-4 border bg-card">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium">Network</h3>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <div className="text-sm">{chain?.name || 'Ethereum'}</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
