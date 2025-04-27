'use client'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Send, Plus } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

export default function Chat() {
    const { open } = useSidebar()
    const { theme = 'dark' } = useTheme()
    const [message, setMessage] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Textarea boyutunu otomatik büyüt
    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = textarea.scrollHeight + 'px'
        }
    }, [message])

    // Static prompts for quick insertion into the textarea
    const prompts = ['Tell me about the platform.', 'What is the latest update?', 'How do I use the app?', 'Can you help with troubleshooting?']

    // Handle prompt click to set the message
    const handlePromptClick = (prompt: string) => {
        setMessage(prompt)
    }

    const imageSrc = '/coinbeats-l.svg'
    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4 bg-background relative">
            {!open && (
                <div className="absolute top-2 left-4 z-50">
                    <SidebarTrigger />
                </div>
            )}

            {/* Logo Section */}
            <div className="mb-4">
                <div className="relative w-[150px] h-[50px]">
                    <Image src={imageSrc} alt="Coin-Beats" fill className="object-contain" />
                </div>
            </div>

            <div className="text-2xl md:text-3xl font-bold mb-6 text-center">What can I help with?</div>

            {/* Static Prompts */}
            <div className="w-full max-w-2xl text-center mb-6">
                <div className=" text-muted-foreground mb-2 italic">Chat with Coinbeats AI</div>
                <div className="flex gap-4 justify-center flex-wrap">
                    {prompts.map((prompt, index) => (
                        <Button key={index} variant="secondary" onClick={() => handlePromptClick(prompt)} className="px-4 py-2 text-sm cursor-pointer">
                            {prompt}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-2xl bg-muted/20 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex items-end gap-2 bg-muted/30 rounded-2xl px-4 py-2">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask anything..."
                        rows={1}
                        className="flex-1 resize-none overflow-hidden bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 border-none"
                    />
                    <Button size="icon" variant="ghost" className="cursor-pointer">
                        <Send className="h-5 w-5 " />
                    </Button>
                </div>
            </div>
        </main>
    )
}
