// src/pages/TelegramGroupDetailPage.tsx

import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Page, Card, Block } from 'konsta/react'
import { Icon } from '@iconify/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import useDiscoverStore from '../store/useDiscoverStore'

interface TelegramGroup {
    id: number
    name: string
    description?: string
    telegramUrl?: string
    logoUrl?: string
    coverPhotoUrl?: string
    categories?: { id: number; name: string }[]
    chains?: { id: number; name: string }[]
}

const TelegramGroupDetailPage: React.FC = () => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const [group, setGroup] = useState<TelegramGroup | null>(null)
    const { telegramGroups, fetchTelegramGroups } = useDiscoverStore()

    const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview')

    useEffect(() => {
        const stateItem = location.state?.item as TelegramGroup | undefined
        if (stateItem) {
            setGroup(stateItem)
        } else {
            if (telegramGroups.length === 0) {
                fetchTelegramGroups().then(() => {
                    const found = telegramGroups.find((g) => g.id === Number(id))
                    if (found) setGroup(found)
                })
            } else {
                const found = telegramGroups.find((g) => g.id === Number(id))
                if (found) setGroup(found)
            }
        }
    }, [id, location.state, telegramGroups, fetchTelegramGroups])

    const constructImageUrl = (url?: string) => (url ? `https://telegram.coinbeats.xyz/${url}` : '')

    const linkBg = '#444'
    const telegramColor = 'rgba(34,158,217,0.9)'

    const renderLinkButtons = () => {
        if (!group?.telegramUrl) return null
        return (
            <div className="flex gap-3 mt-4 flex-wrap">
                <button
                    onClick={() => window.open(group.telegramUrl, '_blank')}
                    className="p-2 rounded-full hover:opacity-80 transition-all"
                    style={{ backgroundColor: linkBg }}
                    title="Telegram"
                >
                    <Icon icon="mdi:telegram" style={{ color: telegramColor }} className="w-8 h-8" />
                </button>
            </div>
        )
    }

    const renderOverviewTab = () => {
        if (!group) return <p className="text-center mt-4">Loading Telegram Group...</p>

        return (
            <div className="!p-0 mx-4 mt-4 !mb-20 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 pb-16">
                {group.coverPhotoUrl && (
                    <div className="relative w-full h-40 overflow-hidden rounded-b-2xl">
                        <img src={constructImageUrl(group.coverPhotoUrl)} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    </div>
                )}

                {(group.logoUrl || group.name) && (
                    <div className="flex items-center gap-3 px-4 pt-4">
                        {group.logoUrl && (
                            <img
                                src={constructImageUrl(group.logoUrl)}
                                alt="Logo"
                                className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-800"
                            />
                        )}
                        {group.name && <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{group.name}</h2>}
                    </div>
                )}

                <div className="px-4 pb-4">
                    {(group.categories?.length || 0) > 0 || (group.chains?.length || 0) > 0 ? (
                        <Block className="mt-4 !p-0">
                            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">About:</h3>
                            <div className="flex flex-wrap gap-2">
                                {group.categories?.map((cat) => (
                                    <span key={cat.id} className="bg-blue-200 dark:bg-blue-700 text-xs px-2 py-1 rounded-full">
                                        {cat.name}
                                    </span>
                                ))}
                                {group.chains?.map((chain) => (
                                    <span key={chain.id} className="bg-green-200 dark:bg-green-700 text-xs px-2 py-1 rounded-full">
                                        {chain.name}
                                    </span>
                                ))}
                            </div>
                        </Block>
                    ) : null}

                    {group.description && (
                        <div className="mt-4">
                            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description:</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{group.description}</p>
                        </div>
                    )}

                    {renderLinkButtons()}

                    <div className="mt-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-gradient-to-t from-[#ff0077] to-[#7700ff] text-white border-[#9c27b0] font-bold rounded-full border-2 shadow-md transition-all"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const renderTasksTab = () => {
        return (
            <Card className="mx-4 mt-4 p-4 rounded-xl shadow-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600">
                <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">Tasks</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300">No tasks yet!</p>
            </Card>
        )
    }

    return (
        <Page className="overflow-auto">
            <Navbar />
            <Sidebar />

            <div className="flex gap-2 px-4 mt-4">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-1 rounded-full border text-sm font-bold transition-all ${
                        activeTab === 'overview'
                            ? 'bg-gradient-to-t from-[#ff0077] to-[#7700ff] text-white border-[#9c27b0]'
                            : 'bg-gray-800 text-white border-gray-600'
                    }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-4 py-1 rounded-full border text-sm font-bold transition-all ${
                        activeTab === 'tasks'
                            ? 'bg-gradient-to-t from-[#ff0077] to-[#7700ff] text-white border-[#9c27b0]'
                            : 'bg-gray-800 text-white border-gray-600'
                    }`}
                >
                    Tasks
                </button>
            </div>

            {activeTab === 'overview' ? renderOverviewTab() : renderTasksTab()}

            <BottomTabBar activeTab="tab-1" setActiveTab={() => {}} />
        </Page>
    )
}

export default TelegramGroupDetailPage
