import React, { useState, useEffect, useRef } from 'react'
import { Button, Card, Notification, Popover } from 'konsta/react'
import {
    IconHelpCircle,
    IconCopy,
    IconEditCircle,
    IconInnerShadowTopRight,
    IconPlayerStopFilled,
    IconArrowUp,
    IconLayoutSidebarRightCollapseFilled
} from '@tabler/icons-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useChainId } from 'wagmi'
import logo1 from '../../images/coinbeats-l.svg'
import InitialPrompts from './components/InitialPrompts'
import Navbar from '../common/Navbar'
import bunnyLogo from '../../images/bunny-mascot.png'
import axiosInstance from '~/api/axiosInstance'
import Typewriter from './components/Typewriter'
import AiChatSidebar from './components/AiChatSidebar'

interface ResponseMessage {
    sender: string // "user" or "ai"
    content: string
}

interface Response {
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

const AiChat: React.FC = () => {
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const sidebarRef = useRef<HTMLDivElement>(null)
    const editContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    // const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const { wallets, ready: walletsReady } = useWallets()
    const abortControllerRef = useRef<AbortController | null>(null)
    const chainId = useChainId()
    const [prompt, setPrompt] = useState('')
    const [responses, setResponses] = useState<Response[]>([])
    const [loading, setLoading] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024)
    const [notification, setNotification] = useState<{ title: string; text: string } | null>(null)
    const [editingChat, setEditingChat] = useState<{ title: string }>({ title: '' })
    const [isTyping, setIsTyping] = useState(false)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const { ready, authenticated, user, getAccessToken, login, logout } = usePrivy()

    useEffect(() => {
        if (!authenticated) {
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

    // Auto-scroll to the latest message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [responses])

    // Copy a message's content to the clipboard
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
            updated[updated.length - 1].conversationHistory[1].content = 'Prompt cancelled'
            return updated
        })
        setPrompt('')
    }

    const handleNewChat = async () => {
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
        if (window.innerWidth < 1024) setIsSidebarCollapsed(true)
    }

    const handleSendPrompt = async () => {
        const trimmed = prompt.trim()
        if (!trimmed) return

        if (!authenticated) {
            setNotification({ title: 'Login required', text: 'Please log in first.' })
            return
        }
        // if (!walletsReady || !wallets.length) {
        //     setNotification({ title: 'Wallet connection required', text: 'Please connect your wallet first.' })
        //     return
        // }

        setLoading(true)
        const textarea = document.querySelector('textarea')
        if (textarea) {
            textarea.style.height = '130px'
        }
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }

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

            // Update the last chat bubble with the final answer
            setResponses((prev) => {
                const updated = [...prev]
                const lastItem = updated[updated.length - 1]
                lastItem.conversationHistory[1].content = finalAiContent
                // Attach any transaction data
                if (newResponse.data) {
                    lastItem.data = newResponse.data
                }
                return updated
            })
        } catch (error) {
            if (error?.response?.status == 401) {
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

    // Render a single chat bubble
    const renderChatBubble = (message: ResponseMessage, idx: number, isLast: boolean) => {
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
                            Coinbeats AI is thinking... <IconInnerShadowTopRight className="animate-spin size-5" />
                        </div>
                    ) : isUser || !isLast ? (
                        <span className="text-[14px] lg:text-[16px]">{message.content.replace('Coinbeats AI is thinking...', '').trim()}</span>
                    ) : (
                        <Typewriter text={message.content.replace('Coinbeats AI is thinking...', '').trim()} className="text-[14px] lg:text-[16px]" speed={2} />
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

    return (
        <div className="col-span-12 h-[96vh] fixed w-full">
            <Navbar />

            <div className="flex">
                <div
                    className={`transition-transform ease-in-out ${isSidebarCollapsed ? 'w-0 -translate-x-full duration-700' : 'w-[70%] lg:w-[18%] translate-x-0 duration-500'} ${!isSidebarCollapsed ? 'fixed z-50 shadow-lg' : ''}`}
                    ref={sidebarRef}
                >
                    {isSidebarCollapsed ? (
                        <IconLayoutSidebarRightCollapseFilled className="absolute size-6 hover:text-primary mt-3 ml-4" onClick={toggleSidebar} />
                    ) : (
                        <AiChatSidebar toggleSidebar={toggleSidebar} handleNewChat={handleNewChat} />
                    )}
                </div>

                {/* Main Chat Container */}
                <div
                    className={`
                        flex flex-col pt-1 items-center justify-between flex-1 h-[95vh]
                        transition-all duration-500 ease-in-out
                        ${!isSidebarCollapsed ? 'filter blur-md md:blur-none md:ml-[18%]' : ''}
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
                        <div className={'flex flex-col items-center mt-40 select-none'}>
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
                                    {response.conversationHistory.map((msg, msgIdx) => renderChatBubble(msg, msgIdx, i == responses.length - 1))}
                                    {response.data && renderTransactionCard(response.data, i)}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* Input area */}
                    <div
                        className="px-4 w-full bg-black mb-4 flex flex-col sticky bottom-0 lg:w-[800px]"
                        style={{
                            // Extra padding to ensure you see the bottom when keyboard is open
                            paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)'
                        }}
                    >
                        <textarea
                            className="pb-14 bg-[#2b2b2b] text-[16px] p-4 rounded-lg focus:outline-none resize-none min-h-[130px] max-h-[500px] "
                            placeholder="Type a message..."
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value)
                                adjustHeight(e.target)
                                setIsTyping(true)
                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000)
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
                                className="w-[100px] mb-4 flex gap-1 justify-center border border-gray-400 p-1 w-[120px] text-gray-400 items-center rounded-lg ml-4 absolute bottom-2 left-2 active:bg-gray-100 active:text-black"
                                onClick={handleNewChat}
                            >
                                <IconEditCircle size={18} />
                                New Chat
                            </button>
                        )}

                        {loading ? (
                            <IconPlayerStopFilled
                                className="w-[34px] h-[34px] mr-4 mb-4 bg-gray-300 text-gray-700 absolute bottom-2 right-2 rounded-full p-2 cursor-pointer"
                                onClick={stopPrompt}
                            />
                        ) : isTyping ? (
                            <div className="w-[34px] h-[34px] mr-4 mb-1 bg-gradient-to-r from-[#ff0077] to-[#7700ff] absolute bottom-2 right-2 rounded-full p-1 flex items-center justify-center">
                                <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        ) : (
                            <IconArrowUp
                                className="w-[34px] h-[34px] mr-4 mb-4 bg-gradient-to-r from-[#ff0077] to-[#7700ff] absolute bottom-2 right-2 rounded-full p-1 cursor-pointer"
                                onClick={handleSendPrompt}
                            />
                        )}
                    </div>
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
