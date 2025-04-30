'use client'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus, PenLine, Plus, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { setPrompt } from '@/store/ai-chat/ai_chatSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useMessagesQuery } from '@/store/api/ai_chat.api'
import { useParams, useSearchParams } from 'next/navigation'

type Message = {
    role: 'user' | 'assistant'
    content: string
    streaming?: boolean
}

export default function ChatById() {
    const { open } = useSidebar()
    const dispatch = useAppDispatch()
    const prompt = useAppSelector((state) => state.ai_chat.prompt)
    const messages = useAppSelector((state) => state.ai_chat.messages)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const params = useParams()
    const id = params.chatId

    console.log('messages', messages)

    console.log('[chatId]', id)

    const { currentData: _, isLoading, isFetching } = useMessagesQuery(id)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = textarea.scrollHeight + 'px'
        }
    }, [prompt])

    // const handleSend = () => {
    //     if (!prompt.trim()) return

    //     const userMessage: Message = { role: 'user', content: prompt.trim() }
    //     setMessages((prev) => [...prev, userMessage])
    //     dispatch(setPrompt(''))

    //     const fullReply = `You said: "${prompt.trim()}"` // Replace this with real AI call
    //     const words = fullReply.split(' ')
    //     let currentText = ''
    //     let index = 0

    //     const assistantMessage: Message = { role: 'assistant', content: '', streaming: true }
    //     setMessages((prev) => [...prev, assistantMessage])

    //     const interval = setInterval(() => {
    //         if (index < words.length) {
    //             currentText += (index === 0 ? '' : ' ') + words[index]
    //             index++

    //             setMessages((prev) => {
    //                 const updated = [...prev]
    //                 updated[updated.length - 1] = {
    //                     ...assistantMessage,
    //                     content: currentText + (index % 2 === 0 ? '...' : ''),
    //                     streaming: true
    //                 }
    //                 return updated
    //             })
    //         } else {
    //             clearInterval(interval)
    //             setMessages((prev) => {
    //                 const updated = [...prev]
    //                 updated[updated.length - 1] = {
    //                     role: 'assistant',
    //                     content: currentText,
    //                     streaming: false
    //                 }
    //                 return updated
    //             })
    //         }
    //     }, 300)
    // }

    return (
        <main className="flex flex-col items-center justify-between flex-1 bg-background relative px-4 py-2  ">
            {!open && (
                <div className="fixed top-16.5 left-4 flex items-center gap-2">
                    <SidebarTrigger />
                    <Link href={'/ai-chat'} key={1} scroll={false} className="flex-1">
                        <MessageSquarePlus className="cursor-pointer h-4.5 w-4.5" />
                    </Link>
                </div>
            )}
            <div className="h-[56px] w-full"></div>

            {/* Chat Messages */}
            <div className="w-full max-w-3xl flex-1  mt-4 mb-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`w-full mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'} px-2`}>
                        <div
                            ref={msg.sender === 'user' ? messagesEndRef : undefined}
                            className={`inline-block ${
                                msg.sender === 'user' ? 'bg-muted/80 ' : index === messages?.length - 1 ? 'h-[calc(100vh-160px)]' : ''
                            } rounded-xl px-3 py-2 max-w-[85%] text-sm sm:text-base`}
                        >
                            {msg.message}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="w-full max-w-3xl fixed bottom-0 bg-background pb-2">
                <div className="flex items-end gap-2 bg-muted/30 rounded-2xl px-4 py-2">
                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => dispatch(setPrompt(e.target.value))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                // handleSend()
                            }
                        }}
                        placeholder="Ask anything..."
                        rows={1}
                        className="flex-1 resize-none overflow-hidden bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 border-none mb-1.5"
                    />

                    <Button
                        size="icon"
                        variant="ghost"
                        // onClick={handleSend}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </main>
    )
}
