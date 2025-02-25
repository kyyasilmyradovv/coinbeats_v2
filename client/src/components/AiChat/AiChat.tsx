import React, { useState, useEffect, useRef } from 'react'
import { Button, Card, Notification, Popover, Preloader } from 'konsta/react'
import {
    IconHelpCircle,
    IconCopy,
    IconEditCircle,
    IconInnerShadowTopRight,
    IconPlayerStopFilled,
    IconArrowUp,
    IconLayoutSidebarRightCollapseFilled,
    IconArrowDown
} from '@tabler/icons-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useChainId } from 'wagmi'
import logo1 from '../../images/coinbeats-l.svg'
import InitialPrompts from './components/InitialPrompts'
import Navbar from '../common/Navbar'
import bunnyLogo from '../../images/bunny-mascot.png'
import axiosInstance from '~/api/axiosInstance'
import TypeWriter from './components/Typewriter'
import AiChatSidebar from './components/AiChatSidebar'
import { useNavigate } from 'react-router-dom'
import useAcademiesStore from '../../store/useAcademiesStore'

interface LinkInterface {
    id?: number
    name?: string
    logoUrl?: string
}

interface ResponseMessage {
    sender: string // "user" or "ai"
    content: string
    links?: LinkInterface[]
}

interface Response {
    links?: LinkInterface[]
    conversationHistory: ResponseMessage[]
    data?: {
        description: string
        fromAmount: string
        fromToken: { symbol: string; priceUSD: string; decimals?: number }
        toToken: { symbol: string; decimals: number; priceUSD: string }
        toAmount: number
        toAmountUSD: string
        steps: { gasLimit?: string; to?: string }[]
        receiver: string
    }
    answer?: string
}

interface AiChatInterface {
    id: number
    title: string
}

const AiChat: React.FC = () => {
    const navigate = useNavigate()
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const sidebarRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const chainId = useChainId()
    const [prompt, setPrompt] = useState('')
    const [responses, setResponses] = useState<Response[]>([])
    const [loading, setLoading] = useState(false)
    const [isContentLoading, setIsContentLoading] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024)
    const [notification, setNotification] = useState<{ title: string; text: string } | null>(null)
    const [isTyping, setIsTyping] = useState(false)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)
    const [typewritingComplete, setTypewritingComplete] = useState(false)
    const [chats, setChats] = useState<AiChatInterface[]>([])
    const [chatsLoading, setChatsLoading] = useState<boolean>(true)
    const [topics, setTopics] = useState<AiChatInterface[]>([])
    const [activeChatId, setActiveChatId] = useState<number | null>(null)
    const [isHistoricalMessage, setIsHistoricalMessage] = useState(false)
    const [showScrollButton, setShowScrollButton] = useState(false)

    const { ready, authenticated, user, getAccessToken, login, logout } = usePrivy()

    useEffect(() => {
        if (authenticated) {
            getAccessToken()
                .then((token) => {
                    if (!token) {
                        console.warn('No token from getAccessToken()')
                        // return Promise.resolve(null)
                    }
                    localStorage.setItem('privyAccessToken', token)
                    // return Promise.resolve(null)
                })
                .catch((err) => {
                    console.error('Error fetching/creating user =>', err)
                })
        } else {
            login()
        }
    }, [ready, authenticated, user, getAccessToken])

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axiosInstance.get('/api/ai-chat?limit=12')
                setChats(response.data)
            } catch (error) {
                console.error('Failed to fetch chats', error)
            } finally {
                setChatsLoading(false)
            }
        }

        fetchChats()
    }, [])

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await axiosInstance.get('/api/ai-topics?limit=100')
                setTopics(response.data)
            } catch (error) {
                console.error('Failed to fetch topics', error)
            }
        }

        fetchTopics()
    }, [])

    // Auto-scroll to the latest message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [responses])

    useEffect(() => {
        const container = chatContainerRef.current
        if (!container) return
        const handleScrollPosition = () => {
            const { scrollTop, clientHeight, scrollHeight } = container
            if (scrollTop + clientHeight < scrollHeight - 50) {
                setShowScrollButton(true)
            } else {
                setShowScrollButton(false)
            }
        }
        container.addEventListener('scroll', handleScrollPosition)
        return () => container.removeEventListener('scroll', handleScrollPosition)
    }, [])

    const handleCopyContent = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const stopPrompt = () => {
        setLoading(false)

        // Abort the axios request if it's in-flight
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        setResponses((prev) => {
            const updated = [...prev]
            const lastItem = updated[updated.length - 1]
            lastItem.conversationHistory[1].content = 'canceled'
            lastItem.conversationHistory[1].links = []
            return updated
        })
        setPrompt('')
    }

    const handleNewChat = async () => {
        setShowScrollButton(false)
        setLoading(false)
        const textarea = document.querySelector('textarea')
        if (textarea) {
            textarea.style.height = '130px'
        }

        // Abort the axios request if it's in-flight
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        setResponses([])
        setPrompt('')
        setActiveChatId(null)
        if (window.innerWidth < 1024) setIsSidebarCollapsed(true)
    }

    const handleOpenTopic = async (topicId: number) => {
        const textarea = document.querySelector('textarea')
        if (textarea) {
            textarea.style.height = '130px'
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        setResponses([])
        setPrompt('')
        setIsContentLoading(true)
        if (window.innerWidth < 1024) setIsSidebarCollapsed(true)

        const fetchTopic = async (id: number) => {
            try {
                const response = await axiosInstance.get(`/api/ai-topics/${id}`)
                setResponses([
                    {
                        conversationHistory: [
                            { sender: 'user', content: response.data.title },
                            { sender: 'ai', content: response.data.context, links: response.data.academies }
                        ]
                    }
                ])

                setIsContentLoading(false)

                const newChat = await axiosInstance.post('/api/ai-chat', { title: response.data.title })
                chats.unshift(newChat.data)
                handleSetChats(chats)
                setActiveChatId(newChat.data.id)

                await axiosInstance.post(`api/ai-chat/${newChat?.data?.id}/messages`, { sender: 'user', message: response.data.title })
                await axiosInstance.post(`api/ai-chat/${newChat?.data?.id}/messages`, {
                    sender: 'ai',
                    message: response.data.context,
                    academy_ids: response.data.academies?.map((e: any) => e.id)
                })
            } catch (error) {
                setIsContentLoading(false)
                console.log('Error fetching topic', error)
            }
        }

        fetchTopic(topicId)
    }

    const handleOpenChat = async (id: number) => {
        setShowScrollButton(false)
        const textarea = document.querySelector('textarea')
        if (textarea) {
            textarea.style.height = '130px'
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        setResponses([])
        setPrompt('')
        setIsContentLoading(true)
        if (window.innerWidth < 1024) setIsSidebarCollapsed(true)

        const fetchChatMessages = async (id: number) => {
            try {
                const response = await axiosInstance.get(`/api/ai-chat/${id}/messages?limit=100`)
                setIsHistoricalMessage(true)

                const parsedMessages = response.data
                    .map((msg: any) => ({
                        sender: msg.sender,
                        content: msg.message,
                        links: msg.academy_ids?.map((id: number) => academies.find((a) => a.id === id)) || []
                    }))
                    .reverse()

                setResponses([{ conversationHistory: parsedMessages }])
                setIsContentLoading(false)
                // ... rest of the function
            } catch (error) {
                setIsContentLoading(false)
                console.log('Error fetching chat messages', error)
            }
        }

        fetchChatMessages(id)
        setActiveChatId(id)
    }

    const handleSendPrompt = async () => {
        setIsHistoricalMessage(false) // Reset flag for new messages
        const trimmed = prompt.trim()
        if (!trimmed) return

        if (!authenticated) {
            setNotification({ title: 'Login required', text: 'Please log in first.' })
            return
        }
        const isNewChat = responses.length === 0

        setLoading(true)
        const textarea = document.querySelector('textarea')
        if (textarea) {
            textarea.style.height = '130px'
        }
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }

        // Append the user's prompt with the "thinking" AI bubble
        const thinkingBubble: Response = {
            conversationHistory: [
                { sender: 'user', content: trimmed },
                { sender: 'ai', content: 'Coinbeats AI is thinking...' }
            ]
        }

        setResponses((prev) => [...prev, thinkingBubble])
        setPrompt('')

        try {
            const controller = new AbortController()
            abortControllerRef.current = controller

            const res = await axiosInstance.post(
                '/api/ai-chat/chat',
                {
                    prompt: trimmed,
                    chainId: chainId.toString(),
                    address: [],
                    messages: []
                },
                { signal: controller.signal }
            )

            if (res.data.error) {
                setResponses((prev) => {
                    const updated = [...prev]
                    updated[updated.length - 1].conversationHistory[1].content = res.data.error
                    return updated
                })
                return
            }

            let newResponse = res.data.result?.result?.[0] ?? res.data.result?.[0] ?? res.data.result

            if (!newResponse) {
                throw new Error('No valid response received from server.')
            }

            // If it's a transaction object, ensure decimals are set
            if (newResponse.data) {
                newResponse.data.fromToken = {
                    ...newResponse.data.fromToken,
                    decimals: newResponse.data.fromToken.decimals ?? 18
                }
            }

            // The final text we want to display from the server
            let finalAiContent = newResponse.answer || 'No answer provided.'

            // If there's an AI message in conversationHistory, prefer that
            if (newResponse.conversationHistory && newResponse.conversationHistory.some((msg: any) => msg.sender === 'ai')) {
                const lastAiMsg = newResponse.conversationHistory.filter((m: any) => m.sender === 'ai').pop()
                finalAiContent = lastAiMsg.content
            }

            // Update the last chat bubble with the final answer and attach any transaction data
            setResponses((prev) => {
                const updated = [...prev]
                const lastItem = updated[updated.length - 1]
                lastItem.conversationHistory[1].content = finalAiContent
                if (newResponse.data) {
                    lastItem.data = newResponse.data
                }
                return updated
            })

            let activeChatId_ = activeChatId
            if (isNewChat) {
                const newChat = await axiosInstance.post('/api/ai-chat', { prompt: trimmed })
                chats.unshift(newChat.data)
                handleSetChats(chats)
                setActiveChatId(newChat.data.id)
                activeChatId_ = newChat.data.id
            }

            await axiosInstance.post(`api/ai-chat/${activeChatId_}/messages`, { sender: 'user', message: trimmed })
            await axiosInstance.post(`api/ai-chat/${activeChatId_}/messages`, { sender: 'ai', message: finalAiContent })
        } catch (error) {
            if (error?.response?.status == 401) {
                await logout()
                login()
                await handleNewChat()
                return
            }

            console.error('[AiChat] Error sending prompt:', error)
            const errMsg = (error as Error).message || 'Failed to get response from server.'

            setResponses((prev) => {
                const updated = [...prev]
                if (updated?.length) updated[updated.length - 1].conversationHistory[1].content = errMsg
                return updated
            })
        } finally {
            setLoading(false)
            abortControllerRef.current = null
        }
    }

    const adjustHeight = (textarea: any) => {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Remove a transaction card or conversation bubble
    const handleRejectTransaction = (index: number) => {
        setResponses((prev) => prev.filter((_, i) => i !== index))
    }

    // Render a transaction card for on-chain responses
    const renderTransactionCard = (data: Response['data'], index: number) => {
        if (!data) return null
        const { description, fromAmount, fromToken, toToken, toAmount, toAmountUSD, steps, receiver } = data
        return (
            <Card key={`transaction-${index}`} className="mt-4 mb-6 rounded-xl bg-[#2b2b2b] p-4">
                <h5 className="text-white text-lg font-semibold">Transaction Details</h5>
                <span className="text-gray-400 block mb-3">{description}</span>
                <div className="border-t border-gray-700 my-4" />
                <div style={{ color: '#fff', lineHeight: '1.5' }}>
                    <span className="font-bold">From:</span> {parseFloat(fromAmount).toFixed(2)} {fromToken.symbol} ($
                    {fromToken.priceUSD})
                    <br />
                    <span className="font-bold">To:</span> {toToken.symbol} (
                    {parseFloat((toAmount / Math.pow(10, toToken.decimals || 0)).toString()).toFixed(6)}) @ ${toToken.priceUSD}
                    <br />
                    <span className="font-bold">Value:</span> ${toAmountUSD}
                    <br />
                    <span className="font-bold">Gas Price:</span> {steps[0]?.gasLimit ? `${steps[0]?.gasLimit} units` : 'N/A'}
                    <br />
                    <span className="font-bold">Receiver:</span> {receiver}
                    <br />
                    <span className="font-bold">Resolver Address:</span> {steps[0]?.to || 'N/A'}
                </div>
                <div className="border-t border-gray-700 my-4" />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Popover>
                        <div className="p-4">
                            <h3 className="font-bold mb-1">Coming soon!</h3>
                            <p className="text-sm">Transacting will be available with the beta launch.</p>
                            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded">Accept</button>
                        </div>
                    </Popover>

                    <button
                        onClick={() => handleRejectTransaction(index)}
                        className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 cursor-pointer"
                    >
                        Reject
                    </button>
                </div>
            </Card>
        )
    }

    const constructImageUrl = (url: string) => {
        return `https://telegram.coinbeats.xyz/${url}`
    }

    const renderChatBubble = (message: ResponseMessage, links: LinkInterface[], idx: number, isLast: boolean) => {
        const isUser = message.sender === 'user'
        return (
            <div
                key={idx}
                style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    marginBottom: 16
                }}
            >
                <div
                    className="relative min-w-[50%] max-w-[80%] bg-[#2b2b2b] p-3 rounded-xl"
                    style={{
                        whiteSpace: 'pre-line',
                        overflowWrap: 'break-word'
                    }}
                >
                    {/* Copy button */}
                    {!isUser && message.content != 'canceled' && !message.content.includes('Coinbeats AI is thinking...') && (
                        <button onClick={() => handleCopyContent(message.content)} className="absolute top-1 right-1 text-gray-300 p-2 rounded">
                            <IconCopy className="w-4 h-4 active:text-primary active:w-5 active:h-5" />
                        </button>
                    )}

                    {/* Name + avatar row */}
                    {!isUser && (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                            <img src={logo1} alt="avatar" className="mr-2 w-[18px]" />
                            <span className="text-[14px] font-semibold text-gray-300">Coinbeats AI</span>
                        </div>
                    )}

                    {/* If ai is thinking... show spinner */}
                    {message.content.includes('Coinbeats AI is thinking...') && loading ? (
                        <div className="flex gap-1 items-center">
                            Coinbeats AI is thinking... <IconInnerShadowTopRight className="text-primary animate-spin size-5" />
                        </div>
                    ) : isUser || !isLast || isHistoricalMessage ? ( // Check isHistoricalMessage instead of isContentLoading
                        <span className="text-[14px] lg:text-[16px]">{message.content.replace('Coinbeats AI is thinking...', '').trim()}</span>
                    ) : (
                        <div>
                            <TypeWriter
                                text={message.content.replace('Coinbeats AI is thinking...', '').trim()}
                                className="text-[14px] lg:text-[16px]"
                                speed={0}
                                onStart={() => {
                                    setTypewritingComplete(false)
                                }}
                                onDone={() => {
                                    setTypewritingComplete(true)
                                }}
                            />
                        </div>
                    )}

                    {links?.length > 0 && (typewritingComplete || !isLast) && (
                        <div>
                            <div className="flex items-center my-2 mt-8">
                                <div className="flex-grow border-t border-gray-600"></div>
                                <span className="mx-2 text-xs text-gray-400 uppercase tracking-wider">Check those out</span>
                                <div className="flex-grow border-t border-gray-600"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                {links.map(({ id, name, logoUrl }) => (
                                    <div
                                        key={id}
                                        className="flex items-center p-4 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer border"
                                        onClick={() => handleAcademyClick(id)}
                                    >
                                        <img
                                            alt={name}
                                            className="h-8 md:h-10 mr-3 rounded-full object-cover"
                                            src={constructImageUrl(logoUrl || '')}
                                            loading="lazy"
                                        />
                                        <span className="font-semibold text-gray-500 truncate max-w-[120px]">{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => !prev)
    }

    // Close sidebar when clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (window.innerWidth < 1024 && chatContainerRef.current?.contains(event.target) && !sidebarRef.current?.contains(event.target)) {
                setIsSidebarCollapsed(true)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSwipe = () => {
        if (touchStart !== null && touchEnd !== null) {
            const delta = touchEnd - touchStart
            const threshold = 50
            if (delta > threshold) {
                setIsSidebarCollapsed(false)
            } else if (delta < -threshold) {
                setIsSidebarCollapsed(true)
            }
        }
        setTouchStart(null)
        setTouchEnd(null)
    }

    const { academies } = useAcademiesStore((state) => ({
        academies: state.academies
    }))

    const handleAcademyClick = async (id: number) => {
        try {
            const academy = academies.find((a) => a.id === id)
            if (academy) navigate(`/product/${id}`, { state: { academy } })
        } catch (error) {
            console.error('Error fetching academy details:', error)
        }
    }

    const handleSetChats = (chats: AiChatInterface[]) => {
        setChats(chats)
    }

    return (
        <div
            className="col-span-12 h-[96vh] fixed w-full"
            onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
            onTouchMove={(e) => setTouchEnd(e.touches[0].clientX)}
            onTouchEnd={handleSwipe}
        >
            <Navbar />

            <div className="flex">
                <div
                    className={`transition-transform ease-in-out ${isSidebarCollapsed ? 'w-0 -translate-x-full duration-700' : 'w-[70%] lg:w-[18%] translate-x-0 duration-500'} ${!isSidebarCollapsed ? 'fixed z-50 shadow-lg' : ''}`}
                    ref={sidebarRef}
                >
                    {isSidebarCollapsed ? (
                        <IconLayoutSidebarRightCollapseFilled className="absolute size-6 text-gray-200 hover:text-primary mt-3 ml-4" onClick={toggleSidebar} />
                    ) : (
                        <AiChatSidebar
                            chats={chats}
                            handleSetChats={handleSetChats}
                            chatsLoading={chatsLoading}
                            topics={topics}
                            toggleSidebar={toggleSidebar}
                            handleNewChat={handleNewChat}
                            handleOpenTopic={handleOpenTopic}
                            handleOpenChat={handleOpenChat}
                        />
                    )}
                </div>
                {/* Main Chat Container */}
                <div
                    className={`
                        flex flex-col pt-1 items-center justify-between flex-1 h-[95vh]
                        transition-all duration-500 ease-in-out
                        ${!isSidebarCollapsed || isContentLoading ? 'filter blur-md md:blur-none md:ml-[18%]' : ''}
                      `}
                    ref={chatContainerRef}
                    style={{
                        msOverflowStyle: 'none',
                        overflowY: 'auto',
                        scrollbarWidth: 'none', // For Firefox
                        scrollbarColor: '#555 #333'
                    }}
                >
                    {/* Header + initial prompts */}
                    {responses.length === 0 && (
                        <div className={'flex flex-col items-center mt-[140px] select-none'}>
                            <img src={logo1} alt="Coinbeats AI Chat" className="h-[50px] mx-auto" />
                            <h2 className="mt-2 mb-2 text-2xl font-bold text-white">Coinbeats AI Chat</h2>
                            <button className="flex mb-10 items-center gap-2 text-white text-sm italic">
                                <span className="font-normal">Chat with Coinbeats AI</span>
                                <IconHelpCircle className="w-4 h-4" />
                            </button>
                            <InitialPrompts onSelectPrompt={(promptText) => setPrompt(promptText)} />
                        </div>
                    )}

                    {/* Conversation area */}
                    {responses.length > 0 && (
                        <div
                            // ref={chatContainerRef}
                            className="w-[90%] lg:w-[800px] p-5 text-gray-100"
                        >
                            {responses.map((response, i) => (
                                <React.Fragment key={i}>
                                    {response.conversationHistory.map((msg, msgIdx) =>
                                        renderChatBubble(msg, msg?.links || [], msgIdx, i == responses.length - 1)
                                    )}
                                    {response.data && renderTransactionCard(response.data, i)}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* Input area */}
                    <div
                        className="relative px-4 w-full bg-black flex flex-col sticky bottom-0 lg:w-[800px]"
                        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
                    >
                        {showScrollButton && (
                            <button
                                className="absolute top-[-60px] left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-[#ff0077] to-[#7700ff] p-3 rounded-full shadow-lg transition opacity-80 hover:opacity-100"
                                onClick={() => {
                                    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' })
                                    setShowScrollButton(false)
                                }}
                            >
                                <IconArrowDown className="w-6 h-6" />
                            </button>
                        )}

                        <textarea
                            className="pb-14 bg-[#2b2b2b] text-[16px] p-4 mt-2 rounded-lg focus:outline-none resize-none min-h-[130px] max-h-[500px] "
                            placeholder="Type a message..."
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value)
                                adjustHeight(e.target)
                                setIsTyping(true)
                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 600)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendPrompt()
                                }
                            }}
                        />

                        {responses?.length > 0 && (
                            <button
                                className="w-[100px] flex gap-1 justify-center border border-gray-400 p-1 w-[120px] text-gray-400 items-center rounded-lg ml-4 absolute bottom-10 left-2 active:bg-gray-100 active:text-black"
                                onClick={handleNewChat}
                            >
                                <IconEditCircle size={18} />
                                New Chat
                            </button>
                        )}

                        {loading ? (
                            <IconPlayerStopFilled
                                className="w-[34px] h-[34px] mr-4 bg-gray-300 text-gray-700 absolute bottom-10 right-2 rounded-full p-2 cursor-pointer"
                                onClick={stopPrompt}
                            />
                        ) : isTyping ? (
                            <div className="w-[34px] h-[34px] mr-4 bg-gradient-to-r from-[#ff0077] to-[#7700ff] absolute bottom-10 right-2 rounded-full p-1 flex items-center justify-center">
                                <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        ) : (
                            <IconArrowUp
                                className="w-[34px] h-[34px] mr-4 bg-gradient-to-r from-[#ff0077] to-[#7700ff] absolute bottom-10 right-2 rounded-full p-1 cursor-pointer"
                                onClick={handleSendPrompt}
                            />
                        )}
                    </div>

                    {isContentLoading && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                            <Preloader />
                        </div>
                    )}
                </div>
            </div>

            <Notification
                opened={notification?.title !== undefined}
                icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                title={notification?.title}
                text={notification?.text}
                button={<Button onClick={() => setNotification(null)}>OK</Button>}
                onClose={() => setNotification(null)}
                className="fixed"
            />
        </div>
    )
}

export default AiChat
