// client/src/components/BottomTabBar.tsx

import React from 'react'
import { useNavigate } from 'react-router-dom'
import GraduationHat from '../images/graduation-hat.png'
import Bookmark from '../images/raffles.png'
import GamePad from '../images/game-pad.png'
import Trophy from '../images/trophy.png'
import Discover from '../images/discover.png'
import useSessionStore from '../store/useSessionStore'

interface BottomTabBarProps {
    activeTab: string | null
    setActiveTab: (tab: string | null) => void
    handleNavigationAttempt?: (newTab: string | null, navigationAction: () => void) => void
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, setActiveTab, handleNavigationAttempt }) => {
    const navigate = useNavigate()

    const handleTabClick = (tab: string) => {
        const navigationAction = () => {
            setActiveTab(tab)
            switch (tab) {
                case 'tab-1':
                    navigate('/')
                    break
                case 'tab-2':
                    navigate('/saved')
                    break
                case 'tab-3':
                    navigate('/games')
                    break
                case 'tab-4':
                    navigate('/points')
                    break
                case 'tab-5':
                    navigate('/discover')
                    break
                default:
                    break
            }
        }

        if (handleNavigationAttempt) {
            handleNavigationAttempt(tab, navigationAction)
        } else {
            navigationAction()
        }
    }

    const { darkMode } = useSessionStore((state) => ({
        darkMode: state.darkMode
    }))

    return (
        <div className={`left-0 bottom-0 fixed w-full z-50 ${darkMode ? 'bg-[#1C1C1D]' : 'bg-gray-200'} shadow-md border-t border-gray-800`}>
            <div className="flex justify-around h-16">
                {/* Tab 1 */}
                <div className="relative flex-1" onClick={() => handleTabClick('tab-1')}>
                    {/* Bottom Div */}
                    {activeTab === 'tab-1' && (
                        <div className="absolute inset-0 rounded-xl tab-background m-1">
                            {/* Top Div */}
                            <div className={`relative m-[1px] rounded-xl overflow-hidden`}>
                                <div className={`flex flex-col items-center justify-center ${activeTab === 'tab-1' ? 'tab-content' : ''}`}>
                                    <div className="h-10 py-1">
                                        <img src={GraduationHat} alt="Learn" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="tab-label text-xs">Protocols</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`relative m-1 rounded-xl overflow-hidden border border-gray-600`}>
                        <div className={`flex flex-col items-center justify-center ${activeTab === 'tab-1' ? 'tab-content' : ''}`}>
                            <div className="h-10 py-1">
                                <img src={GraduationHat} alt="Learn" className="w-full h-full object-contain" />
                            </div>
                            <span className="tab-label text-xs">Protocols</span>
                        </div>
                    </div>
                </div>
                {/* Tab 5 */}
                {/* <div className="relative flex-1" onClick={() => handleTabClick('tab-5')}>
                    {activeTab === 'tab-5' && (
                        <div className="absolute inset-0 rounded-xl tab-background m-1">
                            <div className={`relative m-[1px] rounded-xl overflow-hidden`}>
                                <div className={`flex flex-col items-center justify-center ${activeTab === 'tab-5' ? 'tab-content' : ''}`}>
                                    <div className="h-10 py-2">
                                        <img src={Discover} alt="Discover" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="tab-label text-xs">Learn</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`relative m-1 rounded-xl overflow-hidden border border-gray-600`}>
                        <div className={`flex flex-col items-center justify-center ${activeTab === 'tab-5' ? 'tab-content' : ''}`}>
                            <div className="h-10 py-2">
                                <img src={Discover} alt="Discover" className="w-full h-full object-contain" />
                            </div>
                            <span className="tab-label text-xs">Learn</span>
                        </div>
                    </div>
                </div> */}
                {/* Tab 2 */}
                <div className="relative flex-1" onClick={() => handleTabClick('tab-2')}>
                    {activeTab === 'tab-2' && (
                        <div className="absolute inset-0 rounded-xl tab-background m-1">
                            <div className={`relative m-[1px] rounded-xl overflow-hidden`}>
                                <div className={`flex flex-col items-center justify-center ${activeTab === 'tab-2' ? 'tab-content' : ''}`}>
                                    <div className="h-10 py-1">
                                        <img src={Bookmark} alt="Bookmarks" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="tab-label text-xs">Raffles</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`relative m-1 rounded-xl overflow-hidden border border-gray-600`}>
                        <div className={`flex flex-col items-center justify-center ${activeTab === 'tab-2' ? 'tab-content' : ''}`}>
                            <div className="h-10 py-1">
                                <img src={Bookmark} alt="Bookmarks" className="w-full h-full object-contain" />
                            </div>
                            <span className="tab-label text-xs">Raffles</span>
                        </div>
                    </div>
                </div>
                {/* Tab 3 */}
                <div className="relative flex-1" onClick={() => handleTabClick('tab-3')}>
                    {activeTab === 'tab-3' && (
                        <div className="absolute inset-0 rounded-xl tab-background m-1">
                            <div className={`relative m-[1px] rounded-xl overflow-hidden`}>
                                <div className={`flex flex-col items-center justify-center ${activeTab === 'tab-3' ? 'tab-content' : ''}`}>
                                    <div className="h-10 py-2">
                                        <img src={GamePad} alt="Earn" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="tab-label text-xs">Earn</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`relative m-1 rounded-xl overflow-hidden border border-gray-600`}>
                        <div className={`flex flex-col items-center justify-center ${activeTab === 'tab-3' ? 'tab-content' : ''}`}>
                            <div className="h-10 py-2">
                                <img src={GamePad} alt="Earn" className="w-full h-full object-contain" />
                            </div>
                            <span className="tab-label text-xs">Earn</span>
                        </div>
                    </div>
                </div>
                {/* Tab 4 */}
                <div className="relative flex-1" onClick={() => handleTabClick('tab-4')}>
                    {activeTab === 'tab-4' && (
                        <div className="absolute inset-0 rounded-xl tab-background m-1">
                            <div className={`relative m-[1px] rounded-xl overflow-hidden`}>
                                <div className={`flex flex-col items-center justify-center ${activeTab === 'tab-4' ? 'tab-content' : ''}`}>
                                    <div className="h-10 py-2">
                                        <img src={Trophy} alt="Points" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="tab-label text-xs">Points</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`relative m-1 rounded-xl overflow-hidden border border-gray-600`}>
                        <div className={`flex flex-col items-center justify-center ${activeTab === 'tab-4' ? 'tab-content' : ''}`}>
                            <div className="h-10 py-2">
                                <img src={Trophy} alt="Points" className="w-full h-full object-contain" />
                            </div>
                            <span className="tab-label text-xs">Points</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BottomTabBar
