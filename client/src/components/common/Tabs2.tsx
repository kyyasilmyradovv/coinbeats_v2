import React, { useState } from 'react'

interface TabProps {
    activeTab1: string
    activeTab2: string
    handleTabChange1: (tab: string) => void
    handleTabChange2: (tab: string) => void
}

const Tabs2: React.FC<TabProps> = ({ activeTab1, activeTab2, handleTabChange1, handleTabChange2 }) => {
    return (
        <div>
            <div className="flex space-x-1 text-[13px] font-bold">
                <button
                    key="top-gainers"
                    className={`px-2 py-2 rounded-2xl text-green-700 ${activeTab1 == 'top-gainers' ? 'bg-gray-300' : 'hover:bg-gray-300'}`}
                    onClick={() => handleTabChange1('top-gainers')}
                >
                    Top Gainers
                </button>

                <button
                    key="top-losers"
                    className={`px-2 py-2 rounded-2xl text-red-700 ${activeTab1 == 'top-losers' ? 'bg-gray-300' : 'hover:bg-gray-300'}`}
                    onClick={() => handleTabChange1('top-losers')}
                >
                    Top Losers
                </button>

                <div className="flex space-x-2">
                    {['1H', '24H', '7D'].map((tab) => (
                        <button
                            key={tab}
                            className={`relative px-2 py-2 text-yellow-700 transition-all duration-200 flex justify-center ${
                                activeTab2 === tab
                                    ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-yellow-700 after:rounded-lg'
                                    : ''
                            }`}
                            onClick={() => handleTabChange2(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Tabs2
