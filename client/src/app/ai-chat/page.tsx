'use client'
import { SidebarTrigger, useSidebar, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Loader2, MessageSquarePlus, Send, Sparkles } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { AIChatInitial } from '@/data/AIChat'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setChats, setIsNewChat, setIsTopic, setMessages, setPrompt } from '@/store/ai-chat/ai_chatSlice'
import { setLoginModalOpen } from '@/store/general/generalSlice'
import Link from 'next/link'
import { useCreateChatMutation } from '@/store/api/ai_chat.api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { TMessage } from '@/types/ai-chat'
import { motion, useAnimation } from 'framer-motion'
import { SignUpModal } from '@/components/signUpModal'
import { LoginModal } from '@/components/loginModal'

export default function NewChat() {
    return (
        <SidebarProvider>
            <AINewChatContent />
        </SidebarProvider>
    )
}

function AINewChatContent() {
    const { open } = useSidebar()
    const router = useRouter()
    const { theme = 'dark' } = useTheme()
    const dispatch = useAppDispatch()
    const chats = useAppSelector((state) => state.ai_chat.chats)
    const messages = useAppSelector((state) => state.ai_chat.messages)
    const prompt = useAppSelector((state) => state.ai_chat.prompt)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const logoControls = useAnimation()
    const promptControls = useAnimation()

    const [lastActivity, setLastActivity] = useState<number>(Date.now())

    const [
        createChat,
        { isSuccess: createChatIsSuccess, data: createChatData, isError: createChatIsError, isLoading: createChatIsLoading, reset: createChatReset }
    ] = useCreateChatMutation()

    useEffect(() => {
        const idleThreshold = 10000

        const handleUserActivity = () => {
            setLastActivity(Date.now())
        }

        const checkIdleStatus = async () => {
            const now = Date.now()
            const idleTime = now - lastActivity

            if (idleTime > idleThreshold) {
                await logoControls.start({
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.9, 1],
                    transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
                })

                await promptControls.start({
                    boxShadow: ['0 4px 12px rgba(0,0,0,0.1)', '0 6px 16px rgba(0,0,0,0.15)', '0 4px 12px rgba(0,0,0,0.1)'],
                    transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
                })
            } else {
                logoControls.stop()
                promptControls.stop()
            }
        }

        window.addEventListener('mousemove', handleUserActivity)
        window.addEventListener('keydown', handleUserActivity)
        window.addEventListener('click', handleUserActivity)

        const idleInterval = setInterval(checkIdleStatus, 1000)

        return () => {
            window.removeEventListener('mousemove', handleUserActivity)
            window.removeEventListener('keydown', handleUserActivity)
            window.removeEventListener('click', handleUserActivity)
            clearInterval(idleInterval)
        }
    }, [lastActivity])

    useEffect(() => {
        if (createChatIsError) {
            toast('Error!', { description: 'Server error. Please try again later.', position: 'top-right' })
        }
        if (createChatIsSuccess) {
            dispatch(setIsNewChat(true))
            dispatch(setIsTopic(false))
            dispatch(setPrompt(''))
            dispatch(setChats([createChatData, ...chats]))
            const aiLoadingMessage: TMessage = { sender: 'ai', message: '', id: 0, academies: [], streaming: true }
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
        const accessToken = localStorage.getItem('coinbeatsAT')

        if (!accessToken) {
            dispatch(setLoginModalOpen(true))
            toast('Please log in to chat with Coinbeats Copilot', {
                position: 'top-right'
            })
            return
        }

        if (!prompt.trim()) {
            toast('Please enter a prompt', { position: 'top-right' })
            return
        }
        await createChat({ prompt: prompt })
    }

    return (
        <>
            <LoginModal />
            <main className="flex-1 flex flex-col items-center justify-start p-4 bg-background relative h-[calc(100vh-56px)] mt-[56px] overflow-y-auto">
                {!open && (
                    <div className="fixed top-16.5 left-4 flex items-center gap-2 z-10">
                        <SidebarTrigger />
                        <Link href={'/ai-chat'} key={1} scroll={false} className="flex-1">
                            <MessageSquarePlus className="cursor-pointer h-4.5 w-4.5" />
                        </Link>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-4xl mx-auto text-center mb-8 mt-4"
                >
                    <motion.div initial={{ scale: 0.9 }} animate={logoControls} className="relative w-[180px] h-[60px] mx-auto mb-6">
                        <Image src={'/coinbeats-l.svg'} alt="Coin-Beats" fill className="object-contain" />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-center justify-center gap-2 mb-2"
                    >
                        <Sparkles className="h-6 w-6 text-primary" />
                        <h1 className="text-3xl md:text-4xl font-bold">
                            Coinbeats <span className="text-primary">Copilot</span> AI
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Your personal AI companion for navigating the crypto world. Coinbeats Copilot provides intelligent insights, answers questions, and
                        gives you the edge in your crypto journey.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="w-full max-w-3xl mx-auto mb-8"
                >
                    <h2 className="text-xl font-medium mb-4 text-center">Try asking Coinbeats Copilot:</h2>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {AIChatInitial.initialPrompts.map((prm, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.97 }}
                                key={index}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => handlePromptClick(prm)}
                                    className="border-primary/20 hover:bg-primary/10 transition-all duration-300 gradient-text-button"
                                >
                                    {prm}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="sticky bottom-4 w-full max-w-3xl mx-auto bg-background pb-4"
                >
                    <motion.div
                        animate={promptControls}
                        className="flex items-end gap-2 bg-muted/30 border border-muted-foreground/10 rounded-2xl px-4 py-3 shadow-lg"
                    >
                        <textarea
                            disabled={createChatIsLoading}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    createChatHandler()
                                }
                            }}
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => dispatch(setPrompt(e.target.value))}
                            placeholder="Ask Coinbeats Copilot anything about crypto..."
                            rows={1}
                            className="flex-1 resize-none overflow-hidden bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 border-none mb-1.5"
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="icon"
                                variant="default"
                                className="rounded-full transition-all duration-300"
                                onClick={createChatHandler}
                                disabled={createChatIsLoading}
                            >
                                {createChatIsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </main>
            <SignUpModal />

            <style jsx global>{`
                .gradient-text-button {
                    background-image: linear-gradient(90deg, #4f46e5, #8b5cf6, #d946ef, #8b5cf6, #4f46e5);
                    background-size: 200% auto;
                    background-clip: text;
                    -webkit-background-clip: text;
                    color: transparent !important;
                    -webkit-text-fill-color: transparent;
                    animation: textGradient 5s linear infinite;
                    border: 1px solid rgba(79, 70, 229, 0.2);
                }

                .gradient-text-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
                    border-color: rgba(79, 70, 229, 0.3);
                }

                @keyframes textGradient {
                    0% {
                        background-position: 0% 50%;
                    }
                    100% {
                        background-position: 200% 50%;
                    }
                }
            `}</style>
        </>
    )
}
