import React, { useState } from 'react'

interface TabProps {
    tabs: string[]
    activeTab: string
    handleTabChange: (tab: string) => void
}

const Tabs: React.FC<TabProps> = ({ tabs, activeTab, handleTabChange }) => {
    return (
        <div>
            <div className="flex justify-center gap-0 items-center w-full mt-4">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 text-sm font-bold rounded-md text-gray-200 ${activeTab === tab && 'bg-blue-500 text-white'}`}
                        onClick={() => handleTabChange(tab)}
                        disabled={tab == '24H' || tab == '1Y'}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Tabs
