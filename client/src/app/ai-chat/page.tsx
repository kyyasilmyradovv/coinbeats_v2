'use client'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { BrainCircuit, Loader2, MessageSquarePlus, Rocket, Send, Sparkles, TrendingUp } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { AIChatInitial } from '@/data/AIChat'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setChats, setIsNewChat, setIsTopic, setMessages, setPrompt } from '@/store/ai-chat/ai_chatSlice'
import { setSignUpModalOpen, setLoginModalOpen } from '@/store/general/generalSlice'
import Link from 'next/link'
import { useCreateChatMutation } from '@/store/api/ai_chat.api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { TMessage } from '@/types/ai-chat'
import { motion, useAnimation } from 'framer-motion'
import { SignUpModal } from '@/components/signUpModal'
import { LoginModal } from '@/components/loginModal'

export default function NewChat() {
    // Existing state and refs
    const { open } = useSidebar()
    const router = useRouter()
    const { theme = 'dark' } = useTheme()
    const dispatch = useAppDispatch()
    const chats = useAppSelector((state) => state.ai_chat.chats)
    const messages = useAppSelector((state) => state.ai_chat.messages)
    const prompt = useAppSelector((state) => state.ai_chat.prompt)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Animation controls for idle animations
    const logoControls = useAnimation()
    const cardControls = useAnimation()
    const promptControls = useAnimation()

    // Idle animation timer
    const [lastActivity, setLastActivity] = useState<number>(Date.now())

    // Mutation remains the same
    const [
        createChat,
        { isSuccess: createChatIsSuccess, data: createChatData, isError: createChatIsError, isLoading: createChatIsLoading, reset: createChatReset }
    ] = useCreateChatMutation()

    // Handle idle animations
    useEffect(() => {
        const idleThreshold = 10000 // 10 seconds

        const handleUserActivity = () => {
            setLastActivity(Date.now())
        }

        const checkIdleStatus = async () => {
            const now = Date.now()
            const idleTime = now - lastActivity

            if (idleTime > idleThreshold) {
                // Start subtle idle animations
                await logoControls.start({
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.9, 1],
                    transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
                })

                await cardControls.start({
                    y: [0, -5, 0],
                    transition: { duration: 3, repeat: Infinity, repeatType: 'reverse', staggerChildren: 0.2 }
                })

                await promptControls.start({
                    boxShadow: ['0 4px 12px rgba(0,0,0,0.1)', '0 6px 16px rgba(0,0,0,0.15)', '0 4px 12px rgba(0,0,0,0.1)'],
                    transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
                })
            } else {
                // Stop animations when user is active
                logoControls.stop()
                cardControls.stop()
                promptControls.stop()
            }
        }

        // Set up event listeners to detect user activity
        window.addEventListener('mousemove', handleUserActivity)
        window.addEventListener('keydown', handleUserActivity)
        window.addEventListener('click', handleUserActivity)

        // Check idle status periodically
        const idleInterval = setInterval(checkIdleStatus, 1000)

        return () => {
            window.removeEventListener('mousemove', handleUserActivity)
            window.removeEventListener('keydown', handleUserActivity)
            window.removeEventListener('click', handleUserActivity)
            clearInterval(idleInterval)
        }
    }, [lastActivity])

    // Existing effects
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
        // Check if user is authenticated
        const accessToken = localStorage.getItem('coinbeatsAT')

        if (!accessToken) {
            // Open login modal instead of signup modal
            dispatch(setLoginModalOpen(true))
            toast('Please log in to chat with Coinbeats Copilot', {
                position: 'top-right'
            })
            return
        }

        // Proceed with creating chat if logged in
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

                {/* Hero Section */}
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

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
                >
                    <FeatureCard
                        icon={<BrainCircuit className="h-8 w-8 text-primary" />}
                        title="Crypto Insights"
                        description="Get instant analysis on market trends, project fundamentals, and trading strategies."
                    />
                    <FeatureCard
                        icon={<TrendingUp className="h-8 w-8 text-primary" />}
                        title="Market Analysis"
                        description="Understand price movements, market sentiment, and potential investment opportunities."
                    />
                    <FeatureCard
                        icon={<Rocket className="h-8 w-8 text-primary" />}
                        title="Learning Resources"
                        description="Access personalized educational content based on your interests and knowledge level."
                    />
                </motion.div>

                {/* Example Prompts */}
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

                {/* Input Area */}
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

            {/* Update the CSS for gradient text effect */}
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

// Feature card component with hover effect and gradient animation
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
    return (
        <motion.div
            className="relative group"
            whileHover={{
                y: -5,
                transition: { type: 'spring', stiffness: 300, damping: 15 }
            }}
        >
            {/* Animated gradient border */}
            <div
                className="absolute -inset-0.5 bg-gradient-to-r from-primary/60 via-blue-500/60 to-violet-500/60 rounded-xl opacity-75 blur-[1px] group-hover:opacity-100 group-hover:blur-[2px]"
                style={{
                    backgroundSize: '400% 400%',
                    animation: 'gradientRotate 8s ease infinite'
                }}
            />

            {/* Card content */}
            <div className="relative bg-background border border-muted-foreground/10 rounded-xl p-6 flex flex-col items-center text-center group-hover:shadow-lg transition-all duration-300">
                <motion.div
                    className="mb-4 bg-primary/10 p-3 rounded-full"
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                >
                    {icon}
                </motion.div>
                <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {/* Circular clockwise keyframes for the animation */}
            <style jsx>{`
                @keyframes gradientRotate {
                    0% {
                        background-position: 0% 0%;
                    }
                    25% {
                        background-position: 100% 0%;
                    }
                    50% {
                        background-position: 100% 100%;
                    }
                    75% {
                        background-position: 0% 100%;
                    }
                    100% {
                        background-position: 0% 0%;
                    }
                }
            `}</style>
        </motion.div>
    )
}
