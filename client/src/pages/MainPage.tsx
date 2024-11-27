// src/pages/MainPage.tsx

import { useLocation } from 'react-router-dom'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomePage from './HomePage'
import BookmarksPage from './BookmarksPage'
import GamesPage from './GamesPage'
import PointsPage from './PointsPage'
import DiscoverPage from './DiscoverPage'
import BottomTabBar from '../components/BottomTabBar'

export default function MainPage() {
    const navigate = useNavigate()
    const location = useLocation() // Hook to access location state
    const [activeTab, setActiveTab] = useState('tab-1')

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        switch (tab) {
            case 'tab-1':
                navigate('/')
                break
            case 'tab-2':
                navigate('/saved', { state: location.state }) // Pass the academy object
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
                navigate('/')
        }
    }

    return (
        <div>
            {activeTab === 'tab-1' && <HomePage />}
            {activeTab === 'tab-2' && <BookmarksPage academy={location.state?.academy} />} {/* Pass academy prop */}
            {activeTab === 'tab-3' && <GamesPage />}
            {activeTab === 'tab-4' && <PointsPage />}
            {activeTab === 'tab-5' && <DiscoverPage />}
            <BottomTabBar activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>
    )
}
