'use client'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus, Send } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { setMessages, setPrompt } from '@/store/ai-chat/ai_chatSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useAskQuestionMutation, useMessagesQuery, useSaveQuestionMutation, useTopicQuery } from '@/store/api/ai_chat.api'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { TMessage, TSender } from '@/types/ai-chat'
import Image from 'next/image'
import { constructImageUrl } from '@/lib/utils'
import { ROUTES } from '@/shared/links'

export default function ChatById() {
    const { open } = useSidebar()
    const dispatch = useAppDispatch()
    const prompt = useAppSelector((state) => state.ai_chat.prompt)
    const messages = useAppSelector((state) => state.ai_chat.messages)
    const isNewChat = useAppSelector((state) => state.ai_chat.isNewChat)
    const isTopic = useAppSelector((state) => state.ai_chat.isTopic)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const params = useParams()
    const id = params.chatId

    const { currentData: topic, isSuccess: topicIsSuccess } = useTopicQuery(localStorage.getItem('topicId') ?? '', { skip: !isTopic })

    const {
        currentData: _,
        isLoading,
        isFetching
    } = useMessagesQuery(id?.toString() ?? '', {
        skip: isNewChat || !id,
        refetchOnMountOrArgChange: true
    })

    const [saveQuestion] = useSaveQuestionMutation()
    const [askQuestion, { isSuccess: askQuestionIsSuccess, data: askQuestionData, isError: askQuestionIsError, reset: askQuestionReset }] =
        useAskQuestionMutation()

    const askQuesFunc = async (question: string, academyIds?: string[]) => {
        await askQuestion({
            prompt: question,
            addresses: [],
            messages: []
        })
        saveQuesFunc(question, 'user', academyIds)
    }

    const saveQuesFunc = async (question: string, sender: TSender, academyIds?: string[]) => {
        await saveQuestion({
            id: Number(id),
            params: {
                message: question,
                sender: sender,
                academy_ids: (academyIds as any) ?? ([] as any)
            }
        })
    }

    useEffect(() => {
        if (isNewChat && !isTopic) {
            askQuesFunc(messages?.[0]?.message)
        }
    }, [id])

    useEffect(() => {
        if (topicIsSuccess) {
            saveQuesFunc(topic?.title ?? '', 'user')
            saveQuesFunc(
                topic?.context ?? '',
                'ai',
                topic?.academies?.map((e) => e.id.toString())
            )
        }
    }, [topicIsSuccess])

    useEffect(() => {
        if (askQuestionIsError) {
            toast('Error!', {
                description: 'Server error. Please try again later.',
                position: 'top-right'
            })
        }

        if (askQuestionIsSuccess && askQuestionData.result.answer) {
            const answer = askQuestionData.result.answer
            const words = answer.split(' ')
            const newMessages = [...messages]
            const lastIndex = newMessages.length - 1

            if (newMessages[lastIndex]?.streaming) {
                let currentText = ''
                let wordIndex = 0

                const interval = setInterval(() => {
                    if (wordIndex >= words.length) {
                        clearInterval(interval)
                        newMessages[lastIndex] = {
                            ...newMessages[lastIndex],
                            message: currentText.trim(),
                            streaming: false
                        }
                        dispatch(setMessages([...newMessages]))
                        saveQuesFunc(answer, 'ai')
                        return
                    }

                    currentText += words[wordIndex] + ' '
                    newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        message: currentText.trim(),
                        streaming: true
                    }
                    dispatch(setMessages([...newMessages]))
                    wordIndex++
                }, 100) // Typing speed (ms per word)
            }
        }

        askQuestionReset()
    }, [askQuestionIsSuccess, askQuestionIsError])

    const scrollToBottom = () => {
        window.scrollTo({ top: document.body.scrollHeight - 900, behavior: 'smooth' })
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
            message: '',
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

            {/* Chat Messages */}
            <div className="w-full max-w-3xl flex-1  mb-24">
                {messages.map((msg, index) => (
                    <div key={index} className={`w-full mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'} px-4`}>
                        <div
                            // ref={msg.sender === 'user' ? messagesEndRef : undefined}
                            className={`inline-block ${
                                msg.sender === 'user' ? 'bg-muted/80' : index === messages?.length - 1 ? 'min-h-[calc(100vh-160px)] ' : ''
                            } rounded-xl px-3 py-2 max-w-[85%] text-sm sm:text-base`}
                        >
                            <span>
                                {msg.message}
                                {msg.streaming && <span className="animate-pulse ml-1">|</span>}
                            </span>

                            {/* Academy Cards */}
                            {msg?.academies?.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    {msg?.academies?.map((academy) => (
                                        <Link href={ROUTES.getAcademyDetails(academy.id)} key={academy.id} className="block">
                                            <div
                                                key={academy.id}
                                                className="flex items-center gap-4 p-4 rounded-xl border border-muted hover:shadow-md transition-shadow bg-card mb-2 cursor-pointer"
                                            >
                                                <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border bg-white">
                                                    <Image src={constructImageUrl(academy.logoUrl)} alt={academy.name} fill className="object-cover" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium text-base">{academy.name}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="w-full max-w-3xl fixed bottom-0 bg-background pb-2">
                <div className="flex items-end gap-2 bg-muted/30 rounded-2xl px-4 py-2 border">
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
