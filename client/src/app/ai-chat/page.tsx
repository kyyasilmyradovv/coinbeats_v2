'use client'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Loader2, MessageSquarePlus, PenLine, Plus, Send } from 'lucide-react'
import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { AIChatInitial } from '@/data/AIChat'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setChats, setIsNewChat, setIsTopic, setMessages, setPrompt } from '@/store/ai-chat/ai_chatSlice'
import Link from 'next/link'
import { useCreateChatMutation } from '@/store/api/ai_chat.api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { TMessage } from '@/types/ai-chat'

export default function NewChat() {
    const { open } = useSidebar()
    const router = useRouter()
    const { theme = 'dark' } = useTheme()
    const dispatch = useAppDispatch()
    const chats = useAppSelector((state) => state.ai_chat.chats)
    const messages = useAppSelector((state) => state.ai_chat.messages)
    const prompt = useAppSelector((state) => state.ai_chat.prompt)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [
        createChat,
        {
            isSuccess: createChatIsSuccess,
            data: createChatData,
            isError: createChatIsError,
            isLoading: createChatIsLoading,
            error: createChatError,
            reset: createChatReset
        }
    ] = useCreateChatMutation()

    useEffect(() => {
        if (createChatIsError) {
            toast('Error!', {
                description: 'Server error. Please try again later.',
                position: 'top-right'
            })
        }
        if (createChatIsSuccess) {
            dispatch(setIsNewChat(true))
            dispatch(setIsTopic(false))
            dispatch(setPrompt(''))
            dispatch(setChats([createChatData, ...chats]))
            const aiLoadingMessage: TMessage = {
                sender: 'ai',
                message: '',
                id: 0,
                academies: [],
                streaming: true
            }
            dispatch(setMessages([{ id: 0, message: prompt, sender: 'user', academies: [] }, aiLoadingMessage]))
            router.push('/ai-chat/' + createChatData.id)
        }
        createChatReset()
    }, [createChatIsSuccess, createChatIsError])

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = textarea.scrollHeight + 'px'
        }
    }, [prompt])

    const handlePromptClick = (value: string) => {
        dispatch(setPrompt(value))
    }

    const createChatHandler = async () => {
        const response = await createChat({ prompt: prompt })
        console.log('response', response.data)
    }

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4 bg-background relative h-[calc(100vh-56px)] mt-[56px]">
            {!open && (
                <div className="fixed top-16.5 left-4 flex items-center gap-2">
                    <SidebarTrigger />
                    <Link href={'/ai-chat'} key={1} scroll={false} className="flex-1">
                        <MessageSquarePlus className="cursor-pointer h-4.5 w-4.5" />
                    </Link>
                </div>
            )}

            <div className="mb-4">
                <div className="relative w-[150px] h-[50px]">
                    <Image src={'/coinbeats-l.svg'} alt="Coin-Beats" fill className="object-contain" />
                </div>
            </div>

            <div className="text-2xl md:text-3xl font-bold mb-6 text-center">{AIChatInitial.main}</div>

            <div className="w-full max-w-2xl text-center mb-6">
                <div className=" text-muted-foreground mb-2 italic">{AIChatInitial.secondary}</div>
                <div className="flex gap-4 justify-center flex-wrap">
                    {AIChatInitial.initialPrompts.map((prm, index) => (
                        <Button key={index} variant="secondary" onClick={() => handlePromptClick(prm)} className="px-4 py-2 text-sm cursor-pointer">
                            {prm}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex items-end gap-2 bg-muted/30 rounded-2xl px-4 py-2 w-full max-w-2xl">
                <textarea
                    disabled={createChatIsLoading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            createChatHandler()
                            // TODO: handle send here
                        }
                    }}
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => dispatch(setPrompt(e.target.value))}
                    placeholder="Ask anything..."
                    rows={1}
                    className="flex-1 resize-none overflow-hidden bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 border-none mb-1.5"
                />
                <Button size="icon" variant="ghost" className="cursor-pointer" onClick={createChatHandler} disabled={createChatIsLoading}>
                    {createChatIsLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="h-5 w-5 " />}
                </Button>
            </div>
        </main>
    )
}
