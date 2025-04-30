'use client'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus, Send } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { setMessages, setPrompt } from '@/store/ai-chat/ai_chatSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useAskQuestionMutation, useMessagesQuery, useSaveQuestionMutation } from '@/store/api/ai_chat.api'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { TMessage, TSender } from '@/types/ai-chat'

export default function ChatById() {
    const { open } = useSidebar()
    const dispatch = useAppDispatch()
    const prompt = useAppSelector((state) => state.ai_chat.prompt)
    const messages = useAppSelector((state) => state.ai_chat.messages)
    const isNewChat = useAppSelector((state) => state.ai_chat.isNewChat)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const params = useParams()
    const id = params.chatId

    const {
        currentData: _,
        isLoading,
        isFetching
    } = useMessagesQuery(id?.toString() ?? '', {
        skip: isNewChat || !id
    })

    const [
        saveQuestion,
        {
            isSuccess: saveQuestionIsSuccess,
            data: saveQuestionData,
            isError: saveQuestionIsError,
            isLoading: saveQuestionIsLoading,
            error: saveQuestionError,
            reset: saveQuestionReset
        }
    ] = useSaveQuestionMutation()

    const [
        askQuestion,
        {
            isSuccess: askQuestionIsSuccess,
            data: askQuestionData,
            isError: askQuestionIsError,
            isLoading: askQuestionIsLoading,
            error: askQuestionError,
            reset: askQuestionReset
        }
    ] = useAskQuestionMutation()

    const askQuesFunc = async (question: string) => {
        await askQuestion({
            prompt: question,
            addresses: [],
            messages: []
        })
        saveQuesFunc(question, 'user')
    }

    const saveQuesFunc = async (question: string, sender: TSender) => {
        await saveQuestion({
            id: Number(id),
            params: {
                message: question,
                sender: sender,
                academy_ids: []
            }
        })
    }

    useEffect(() => {
        if (isNewChat) {
            askQuesFunc(messages?.[0]?.message)
        }
    }, [id])

    useEffect(() => {
        if (askQuestionIsError) {
            toast('Error!', {
                description: 'Server error. Please try again later.',
                position: 'top-right'
            })
        }

        if (askQuestionIsSuccess && askQuestionData.result.answer) {
            const newMessages = [...messages]
            const lastIndex = newMessages.length - 1

            // Replace the loading message
            if (newMessages[lastIndex]?.streaming) {
                newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    message: askQuestionData.result.answer,
                    streaming: false
                }
            } else {
                newMessages.push({
                    id: 0,
                    sender: 'ai',
                    message: askQuestionData.result.answer,
                    academies: [],
                    streaming: false
                })
            }

            dispatch(setMessages(newMessages))
            saveQuesFunc(askQuestionData.result.answer, 'ai')
        }

        askQuestionReset()
    }, [askQuestionIsSuccess, askQuestionIsError])

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

    const handleSend = () => {
        if (!prompt.trim()) return

        const userMessage: TMessage = {
            sender: 'user',
            message: prompt.trim(),
            id: 0,
            academies: []
        }

        const aiLoadingMessage: TMessage = {
            sender: 'ai',
            message: '...',
            id: 0,
            academies: [],
            streaming: true
        }

        dispatch(setMessages([...messages, userMessage, aiLoadingMessage]))
        askQuesFunc(prompt.trim())
        dispatch(setPrompt(''))
    }

    return (
        <main className="flex flex-col items-center justify-between flex-1 bg-background relative px-4 py-2">
            {!open && (
                <div className="fixed top-16.5 left-4 flex items-center gap-2">
                    <SidebarTrigger />
                    <Link href="/ai-chat" key={1} scroll={false} className="flex-1">
                        <MessageSquarePlus className="cursor-pointer h-4.5 w-4.5" />
                    </Link>
                </div>
            )}

            <div className="h-[56px] w-full"></div>

            {/* Chat Messages */}
            <div className="w-full max-w-3xl flex-1 mt-4 mb-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`w-full mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'} px-2`}>
                        <div
                            ref={msg.sender === 'user' ? messagesEndRef : undefined}
                            className={`inline-block ${
                                msg.sender === 'user' ? 'bg-muted/80' : index === messages?.length - 1 ? 'h-[calc(100vh-160px)]' : ''
                            } rounded-xl px-3 py-2 max-w-[85%] text-sm sm:text-base`}
                        >
                            {msg.streaming ? <span className="animate-pulse text-muted-foreground">Coinbeats AI Thinking...</span> : msg.message}
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
                                handleSend()
                            }
                        }}
                        placeholder="Ask anything..."
                        rows={1}
                        className="flex-1 resize-none overflow-hidden bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 border-none mb-1.5"
                    />

                    <Button size="icon" variant="ghost" onClick={handleSend}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </main>
    )
}
