import React, { useState } from 'react'
import { IconSearch, IconLayoutSidebarLeftCollapseFilled, IconEditCircle, IconTrash, IconPencil } from '@tabler/icons-react'

interface AiChatSidebarProps {
    toggleSidebar: () => void
    handleNewChat: () => void
}

const AiChatSidebar: React.FC<AiChatSidebarProps> = ({ toggleSidebar, handleNewChat }) => {
    const chats = [
        { id: 1, title: 'What is crypto?' },
        { id: 2, title: 'How to setup wallet?' },
        { id: 3, title: 'How to do transactions?' }
    ]
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isSearchActive, setIsSearchActive] = useState<boolean>(false)

    // Filter chats based on the search query
    const filteredChats = chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <div className="flex flex-col p-3 bg-[#212121e6] h-[100vh]">
            {/* Header */}
            <div className="flex mb-4 px-1 text-gray-200">
                <IconLayoutSidebarLeftCollapseFilled className="flex-none size-6 hover:text-primary" onClick={toggleSidebar} />

                {/* Search & New Chat Icons */}
                <div className="flex gap-2 justify-end relative flex-1">
                    {isSearchActive && (
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search chats..."
                            className="px-1 ml-2 text-sm bg-[#333] text-white rounded-md w-full max-w-[200px] transition-all duration-300"
                        />
                    )}

                    <IconSearch className="flex-none size-6 hover:text-primary cursor-pointer" onClick={() => setIsSearchActive((prev) => !prev)} />
                    <IconEditCircle className="flex-none size-6 hover:text-primary" onClick={handleNewChat} />
                </div>
            </div>

            {/* Chat Items */}
            {filteredChats.map((e, index) => (
                <div key={index} className="relative flex flex-col" onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                    <div className="w-full flex items-center p-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-[#ff0077] to-[#7700ff] hover:text-white">
                        <span className="truncate flex-1" title={e.title}>
                            {e.title}
                        </span>

                        {/* Action buttons */}
                        {hoveredIndex === index && (
                            <div className="flex gap-1 ml-2">
                                <IconPencil className="size-5 text-gray-300 hover:text-primary cursor-pointer" />
                                <IconTrash className="size-5 text-gray-300 hover:text-primary cursor-pointer" />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AiChatSidebar
