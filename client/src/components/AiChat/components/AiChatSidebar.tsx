import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { IconSearch, IconLayoutSidebarLeftCollapseFilled, IconEditCircle, IconTrash, IconPencil, IconX, IconCheck } from '@tabler/icons-react'

interface AiChatSidebarProps {
    toggleSidebar: () => void
    handleNewChat: () => void
}

const AiChatSidebar: React.FC<AiChatSidebarProps> = ({ toggleSidebar, handleNewChat }) => {
    const editContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const [chats, setChats] = useState([
        { id: 1, title: 'What is crypto?' },
        { id: 2, title: 'How to setup wallet?' },
        { id: 3, title: 'How to do transactions?' }
    ])
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isSearchActive, setIsSearchActive] = useState<boolean>(false)
    const [editingChat, setEditingChat] = useState<{ id: number; title: string } | null>(null)
    const [chatToDelete, setChatToDelete] = useState<number | null>(null)

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

    const filteredChats = chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleEditChat = (id: number, title: string) => {
        setEditingChat({ id, title })
    }

    const handleSaveChat = async (id: number) => {
        try {
            setChats((prevChats) => prevChats.map((chat) => (chat.id === id ? { ...chat, title: editingChat?.title || chat.title } : chat)))
            await fetch(`/api/chats/edit/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editingChat?.title })
            })
        } catch (error) {
            console.error('Failed to save chat title', error)
        } finally {
            setEditingChat(null)
        }
    }

    const handleDeleteChat = async (id: number) => {
        try {
            setChats((prevChats) => prevChats.filter((chat) => chat.id !== id))
            await fetch(`/api/chats/delete/${id}`, { method: 'DELETE' })
        } catch (error) {
            console.error('Failed to delete chat', error)
        }
    }

    return (
        <div className="flex flex-col p-3 bg-[#212121e6] h-[100vh]">
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
                                className="pl-2 pr-7 py-1 text-sm bg-[#333] rounded w-full focus:outline-none focus:border-primary"
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

            {/* Chat Items */}
            {filteredChats.map((chat, index) => (
                <div key={chat.id} className="relative flex flex-col" onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                    <div
                        key={chat.id}
                        className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 ${editingChat && editingChat.id === chat.id ? '' : 'hover:bg-gradient-to-r from-[#ff0077] to-[#7700ff]'}`}
                        style={
                            editingChat && editingChat.id === chat.id
                                ? { border: '1.5px solid', borderImage: 'linear-gradient(to right, #ff0077, #7700ff) 1' }
                                : {}
                        }
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
                                    className="m-size-6 stroke-[3.3px] text-gray-300 hover:text-primary cursor-pointer border-l border-gray-500 pl-1 ml-auto"
                                    onClick={() => handleSaveChat(chat.id)}
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
                                    onClick={() => handleEditChat(chat.id, chat.title)}
                                />
                                <IconTrash className="size-5 text-gray-300 hover:text-primary cursor-pointer" onClick={() => setChatToDelete(chat.id)} />
                            </div>
                        )}

                        {/* Delete Confirmation Modal */}
                        {chatToDelete !== null &&
                            ReactDOM.createPortal(
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                    <div ref={modalRef} className="p-[1.5px] rounded-xl bg-gradient-to-r from-[#ff0077] to-[#7700ff] max-w-xs w-full shadow-lg">
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
        </div>
    )
}

export default AiChatSidebar
