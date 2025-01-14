import React, { useState } from 'react'

interface TabProps {
    tabs: string[]
    activeTab: string
    handleTabChange: (tab: string) => void
}

const Tabs: React.FC<TabProps> = ({ tabs, activeTab, handleTabChange }) => {
    return (
        <div>
            <div className="flex space-x-4 mt-4">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                            activeTab === tab ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-200'
                        }`}
                        onClick={() => handleTabChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Tabs
