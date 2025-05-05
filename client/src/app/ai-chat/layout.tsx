'use client'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ChatSidebar } from '@/components/chatSidebar'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { Wallet } from 'lucide-react'

const WalletSidebar = dynamic(() => import('../../components/wallet'), { ssr: false })

export default function AIChat({ children }: { children: React.ReactNode }) {
    const [showWalletSidebar, setShowWalletSidebar] = useState(false)
    const isMobile = useIsMobile()

    const toggleWalletSidebar = () => {
        setShowWalletSidebar(!showWalletSidebar)
    }

    const closeWalletSidebar = () => {
        setShowWalletSidebar(false)
    }

    return (
        <SidebarProvider>
            <ChatSidebar />
            {isMobile && (
                <div className="fixed top-16.5 left-0 z-10">
                    <Button variant={showWalletSidebar ? 'secondary' : 'ghost'} className="p-2" size="icon">
                        <SidebarTrigger className="h-5 w-5" />
                    </Button>
                </div>
            )}
            <div className="fixed top-16.5 right-0 z-10">
                <Button variant={showWalletSidebar ? 'secondary' : 'ghost'} onClick={toggleWalletSidebar} className="p-2" size="icon">
                    <Wallet className="h-5 w-5" />
                </Button>
            </div>

            {children}
            {showWalletSidebar && (
                <div className="fixed top-[64px] right-0 bottom-0 w-[320px] z-20 shadow-lg ml-4">
                    <WalletSidebar onClose={closeWalletSidebar} />
                </div>
            )}
        </SidebarProvider>
    )
}
