'use client'
import { Button } from '@/components/ui/button'
import { Send, Wallet } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

// Dynamic import to prevent SSR issues
const WalletSidebar = dynamic(() => import('./wallet'), { ssr: false })

export default function Chat() {
    const { theme } = useTheme()
    const [message, setMessage] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [showWalletSidebar, setShowWalletSidebar] = useState(false)

    // Textarea auto-resize
    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = textarea.scrollHeight + 'px'
        }
    }, [message])

    // Static prompts
    const prompts = ['Tell me about the platform.', 'What is the latest update?', 'How do I use the app?', 'Can you help with troubleshooting?']

    const handlePromptClick = (prompt: string) => {
        setMessage(prompt)
    }

    const toggleWalletSidebar = () => {
        setShowWalletSidebar(!showWalletSidebar)
    }

    const closeWalletSidebar = () => {
        setShowWalletSidebar(false)
    }

    const imageSrc = '/coinbeats-l.svg'

    return (
        <div className="flex h-full">
            {/* Main chat area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
                <div className="absolute top-0 right-2 z-10">
                    <Button variant={showWalletSidebar ? 'secondary' : 'ghost'} onClick={toggleWalletSidebar} className="p-2" size="icon">
                        <Wallet className="h-5 w-5" />
                    </Button>
                </div>

                {/* Logo */}
                <div className="mb-4">
                    <div className="relative w-[150px] h-[50px]">
                        <Image src={imageSrc} alt="Coin-Beats" fill className="object-contain" />
                    </div>
                </div>

                <div className="text-2xl md:text-3xl font-bold mb-6 text-center">What can I help with?</div>

                {/* Prompts */}
                <div className="w-full max-w-2xl text-center mb-6">
                    <div className="text-muted-foreground mb-2 italic">Chat with Coinbeats AI</div>
                    <div className="flex gap-4 justify-center flex-wrap">
                        {prompts.map((prompt, index) => (
                            <Button key={index} variant="secondary" onClick={() => handlePromptClick(prompt)} className="px-4 py-2 text-sm">
                                {prompt}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Input area */}
                <div className="w-full max-w-2xl bg-muted/20 rounded-2xl p-4">
                    <div className="flex items-end gap-2 bg-muted/30 rounded-2xl px-4 py-2">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask anything..."
                            rows={1}
                            className="flex-1 resize-none overflow-hidden bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 border-none"
                        />
                        <Button size="icon" variant="ghost">
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </main>

            {/* Wallet sidebar - positioned absolutely */}
            {showWalletSidebar && (
                <div className="fixed top-[64px] right-0 bottom-0 w-[320px] z-20 shadow-lg">
                    <WalletSidebar onClose={closeWalletSidebar} />
                </div>
            )}
        </div>
    )
}
