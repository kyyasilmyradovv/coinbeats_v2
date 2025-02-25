import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { IconSearch, IconLayoutSidebarLeftCollapseFilled, IconEditCircle, IconTrash, IconPencil, IconX, IconCheck } from '@tabler/icons-react'
import axiosInstance from '~/api/axiosInstance'
import { Preloader } from 'konsta/react'

interface AiChatInterface {
    id: number
    title: string
}

interface AiChatSidebarProps {
    chats: AiChatInterface[]
    topics: AiChatInterface[]
    chatsLoading: boolean
    handleSetChats: (chats: AiChatInterface[]) => void
    toggleSidebar: () => void
    handleNewChat: () => void
    handleOpenTopic: (topicId: number) => Promise<void>
    handleOpenChat: (id: number) => Promise<void>
}

interface AiChatInterface {
    id: number
    title: string
}

const AiChatSidebar: React.FC<AiChatSidebarProps> = ({
    chats,
    handleSetChats,
    chatsLoading,
    topics,
    toggleSidebar,
    handleNewChat,
    handleOpenTopic,
    handleOpenChat
}) => {
    const editContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isSearchActive, setIsSearchActive] = useState<boolean>(false)
    const [editingChat, setEditingChat] = useState<{ id: number; title: string } | null>(null)
    const [chatToDelete, setChatToDelete] = useState<number | null>(null)
    const [showRenameSuccess, setShowRenameSuccess] = useState(false)
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
    const [isFetchingMore, setIsFetchingMore] = useState(false)
    const [hasMoreChats, setHasMoreChats] = useState<boolean>(chats?.length > 11)

    useEffect(() => {
        if (editingChat && inputRef.current) {
            const length = inputRef.current.value.length
            inputRef.current.focus()
            inputRef.current.setSelectionRange(length, length)
        }
    }, [editingChat])

    useEffect(() => {
        if (editingChat) {
            const handleClickOutside = (event: MouseEvent) => {
                if (editContainerRef.current && !editContainerRef.current.contains(event.target as Node)) {
                    setEditingChat(null)
                    setHoveredIndex(null)
                }
            }
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [editingChat])

    useEffect(() => {
        if (chatToDelete !== null) {
            const handleClickOutside = (event: MouseEvent) => {
                if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                    setChatToDelete(null)
                    setHoveredIndex(null)
                }
            }
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [chatToDelete])

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text

        const regex = new RegExp(`(${query})`, 'gi')
        return text.split(regex).map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span key={index} className="bg-yellow-400 text-black rounded px-0.5 ">
                    {part}
                </span>
            ) : (
                part
            )
        )
    }

    const filteredChats = chats?.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleEditChat = (id: number, title: string) => {
        setEditingChat({ id, title })
    }

    const handleSaveChat = async (id: number) => {
        try {
            handleSetChats(chats?.map((chat) => (chat.id === id ? { ...chat, title: editingChat?.title || chat.title } : chat)))
            await axiosInstance.put(`/api/ai-chat/${id}`, { title: editingChat?.title })
            setShowRenameSuccess(true)
            setTimeout(() => setShowRenameSuccess(false), 1000)
        } catch (error) {
            console.error('Failed to save chat title', error)
        } finally {
            setEditingChat(null)
        }
    }

    const handleDeleteChat = async (id: number) => {
        try {
            setShowDeleteSuccess(true)
            setTimeout(() => setShowDeleteSuccess(false), 1000)
            await axiosInstance.delete(`/api/ai-chat/${id}`)
            handleSetChats(chats.filter((chat) => chat.id !== id))
        } catch (error) {
            console.error('Failed to delete chat', error)
        }
    }

    const handleFetchMore = async () => {
        setIsFetchingMore(true)
        try {
            const res = await axiosInstance.get('/api/ai-chat?limit=12&offset=' + filteredChats.length)
            const newChats = res.data
            handleSetChats([...chats, ...newChats])
            // If we get less than 12 chats, we've reached the end
            setHasMoreChats(newChats.length === 12)
        } catch (error) {
            console.error('Error fetching more chats:', error)
        } finally {
            setIsFetchingMore(false)
        }
    }

    return (
        <div
            className="flex flex-col p-3 bg-[#212121e6] h-[95vh]"
            style={{
                msOverflowStyle: 'none',
                overflowY: 'auto',
                scrollbarWidth: 'none', // For Firefox
                scrollbarColor: '#555 #333'
            }}
        >
            {/* Header */}
            <div className="flex mb-4 px-1 h-6 text-gray-200 items-center">
                <IconLayoutSidebarLeftCollapseFilled className="flex-none size-6 hover:text-primary" onClick={toggleSidebar} />
                <div className="flex justify-end relative flex-1 items-center">
                    {isSearchActive && (
                        <div className="relative w-full mr-1 ml-1 max-w-[200px]">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search chats..."
                                className="pl-2 pr-7 py-1 text-sm  text-white bg-[#333] rounded w-full focus:outline-none focus:border-primary"
                            />
                            {searchQuery && (
                                <IconX
                                    className="absolute h-5 right-1 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer active:text-primary md:hover:text-primary"
                                    onClick={() => setSearchQuery('')}
                                />
                            )}
                        </div>
                    )}
                    <IconSearch
                        className="flex-none mr-2 size-6 text-gray-300 active:text-primary md:hover:text-primary cursor-pointer"
                        onClick={() => setIsSearchActive((prev) => !prev)}
                    />
                    <IconEditCircle className="flex-none size-6 active:text-primary md:hover:text-primary" onClick={handleNewChat} />
                </div>
            </div>

            {/* My Chats */}
            <div className="flex items-center my-2">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="mx-2 text-xs text-gray-400 uppercase tracking-wider">My Chats</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            {chatsLoading ? (
                <div className="flex items-center justify-center py-6">
                    <Preloader />
                </div>
            ) : filteredChats?.length > 0 ? (
                <>
                    {filteredChats.map((chat, index) => (
                        <div
                            key={chat.id}
                            className="relative flex flex-col"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div
                                key={chat.id}
                                className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 ${editingChat && editingChat.id === chat.id ? '' : 'hover:bg-gradient-to-r from-[#ff0077] to-[#7700ff]'}`}
                                style={
                                    editingChat && editingChat.id === chat.id
                                        ? { border: '1.5px solid', borderImage: 'linear-gradient(to right, #ff0077, #7700ff) 1' }
                                        : {}
                                }
                                onClick={() => handleOpenChat(chat.id)}
                            >
                                {editingChat && editingChat.id === chat.id ? (
                                    <div ref={editContainerRef} className="flex w-full items-center">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={editingChat.title}
                                            onChange={(e) => setEditingChat({ ...editingChat, title: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveChat(chat.id)
                                            }}
                                            className="bg-transparent focus:outline-none"
                                        />
                                        <IconCheck
                                            className="w-6 h-6 stroke-[3.3px] text-gray-300 hover:text-primary cursor-pointer border-l border-gray-500 pl-1 ml-auto"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleSaveChat(chat.id)
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <span className="truncate flex-1 select-none" title={chat.title}>
                                        {highlightMatch(chat.title, searchQuery)}
                                    </span>
                                )}
                                {hoveredIndex === index && !editingChat && (
                                    <div className="flex gap-1 ml-2">
                                        <IconPencil
                                            className="size-5 text-gray-300 hover:text-primary cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleEditChat(chat.id, chat.title)
                                            }}
                                        />
                                        <IconTrash
                                            className="size-5 text-gray-300 hover:text-primary cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setChatToDelete(chat.id)
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Delete Confirmation Modal */}
                                {chatToDelete !== null &&
                                    ReactDOM.createPortal(
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                            <div
                                                ref={modalRef}
                                                className="p-[1.5px] rounded-xl bg-gradient-to-r from-[#ff0077] to-[#7700ff] max-w-xs w-full shadow-lg"
                                            >
                                                <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                                                    <p className="mb-4">Once deleted, the chat can't be restored. Are you sure you want to delete?</p>
                                                    <div className="flex justify-center gap-4">
                                                        <button
                                                            className="px-4 py-2 rounded hover:bg-gray-300 text-gray-800 bg-gray-200"
                                                            onClick={() => {
                                                                setChatToDelete(null)
                                                                setHoveredIndex(null)
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                                            onClick={() => {
                                                                handleDeleteChat(chatToDelete)
                                                                setChatToDelete(null)
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>,
                                        document.body
                                    )}
                            </div>
                        </div>
                    ))}
                    {isFetchingMore ? (
                        <div className="flex items-center justify-center py-4">
                            <Preloader />
                        </div>
                    ) : hasMoreChats ? (
                        <div className="flex justify-end pr-2 text-gray-400 text-sm cursor-pointer hover:text-primary" onClick={handleFetchMore}>
                            Fetch more...
                        </div>
                    ) : null}
                </>
            ) : (
                <div className="flex items-center justify-center py-6">
                    <p className="text-center text-gray-400 text-sm italic">No chats found... Start a new conversation and your chats will appear here.</p>
                </div>
            )}

            {/* Trending Topics */}
            <div className="flex items-center my-2 mt-8">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="mx-2 text-xs text-gray-400 uppercase tracking-wider">Trending Topics</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
            {topics?.length > 0 ? (
                topics.map((topic, index) => (
                    <div key={topic.id} className="relative flex flex-col">
                        <div
                            key={topic.id}
                            className="w-full flex items-center p-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r from-[#ff0077] to-[#7700ff]"
                            onClick={() => handleOpenTopic(topic.id)}
                        >
                            <span className="truncate flex-1 select-none">{topic.title}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex items-center justify-center py-4">
                    <Preloader />
                </div>
            )}

            {/* Rename Success Modal */}
            {showRenameSuccess &&
                ReactDOM.createPortal(
                    <>
                        <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-[#ff0077] to-[#7700ff] max-w-xs w-full shadow-lg">
                                <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                                    <svg className="w-20 h-20 mx-auto" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="26" cy="26" r="25" stroke="#86efac" strokeWidth="2" />
                                        <path
                                            d="M14 27l7 7 16-16"
                                            stroke="#16a34a"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeDasharray="48"
                                            strokeDashoffset="48"
                                            style={{ animation: 'dash 0.3s ease-in-out forwards' }}
                                        />
                                    </svg>
                                    <span className="mt-4 block text-lg font-bold">Chat renamed!</span>
                                </div>
                            </div>
                        </div>
                    </>,
                    document.body
                )}

            {/* Delete Success Modal */}
            {showDeleteSuccess &&
                ReactDOM.createPortal(
                    <>
                        <style>{`@keyframes trashPop {
                            0% { transform: scale(0); opacity: 0; }
                            50% { transform: scale(1.2); opacity: 1; }
                            100% { transform: scale(1); opacity: 1; }
                        }`}</style>
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-[#ff0077] to-[#7700ff] max-w-xs w-full shadow-lg">
                                <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                                    <svg
                                        className="w-20 h-20 mx-auto stroke-red-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ animation: 'trashPop 0.5s ease-out forwards' }}
                                    >
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14H6L5 6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                        <path d="M9 6V4h6v2" />
                                    </svg>
                                    <span className="mt-4 block text-lg font-bold">Chat deleted!</span>
                                </div>
                            </div>
                        </div>
                    </>,
                    document.body
                )}
        </div>
    )
}

export default AiChatSidebar
