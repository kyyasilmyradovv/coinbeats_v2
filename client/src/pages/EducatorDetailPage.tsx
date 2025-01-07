// src/pages/EducatorDetailPage.tsx

import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Page, Card, Block } from 'konsta/react'
import { Icon } from '@iconify/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import useDiscoverStore from '../store/useDiscoverStore'

interface CategoryOrChain {
    id: number
    name: string
}

interface Educator {
    id: number
    name: string
    bio?: string
    avatarUrl?: string
    youtubeUrl?: string
    twitterUrl?: string
    telegramUrl?: string
    discordUrl?: string
    coverPhotoUrl?: string
    logoUrl?: string
    categories?: CategoryOrChain[]
    chains?: CategoryOrChain[]
    // NEW FIELDS
    webpageUrl?: string
    substackUrl?: string
}

const EducatorDetailPage: React.FC = () => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const [educator, setEducator] = useState<Educator | null>(null)
    const { educators, fetchEducators } = useDiscoverStore()

    const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview')

    useEffect(() => {
        const stateItem = location.state?.item as Educator | undefined
        if (stateItem) {
            setEducator(stateItem)
        } else {
            if (educators.length === 0) {
                fetchEducators().then(() => {
                    const found = educators.find((e) => e.id === Number(id))
                    if (found) setEducator(found)
                })
            } else {
                const found = educators.find((e) => e.id === Number(id))
                if (found) setEducator(found)
            }
        }
    }, [id, location.state, educators, fetchEducators])

    const constructImageUrl = (url?: string) => (url ? `https://telegram.coinbeats.xyz/${url}` : '')

    // Link icon mapping
    const linkIcons: Record<string, { icon: string; label: string; iconColor: string }> = {
        youtubeUrl: { icon: 'mdi:youtube', label: 'YouTube', iconColor: 'rgba(255,0,0,0.9)' },
        twitterUrl: { icon: 'mdi:twitter', label: 'Twitter', iconColor: 'rgba(29,161,242,0.9)' },
        telegramUrl: { icon: 'mdi:telegram', label: 'Telegram', iconColor: 'rgba(34,158,217,0.9)' },
        discordUrl: { icon: 'mdi:discord', label: 'Discord', iconColor: 'rgba(88,101,242,0.9)' },

        // NEW: webpage & substack
        webpageUrl: { icon: 'mdi:web', label: 'Website', iconColor: 'rgba(30,150,250,0.9)' },
        substackUrl: { icon: 'simple-icons:substack', label: 'Substack', iconColor: 'rgba(255,130,0,0.9)' }
    }

    const renderLinkButtons = () => {
        if (!educator) return null
        const links = [
            { field: 'youtubeUrl', url: educator.youtubeUrl },
            { field: 'twitterUrl', url: educator.twitterUrl },
            { field: 'telegramUrl', url: educator.telegramUrl },
            { field: 'discordUrl', url: educator.discordUrl },

            // New
            { field: 'webpageUrl', url: educator.webpageUrl },
            { field: 'substackUrl', url: educator.substackUrl }
        ]

        return (
            <div className="flex gap-3 mt-4 flex-wrap">
                {links.map((item, idx) => {
                    if (!item.url) return null
                    const config = linkIcons[item.field] || {
                        icon: 'mdi:link-variant',
                        label: 'Link',
                        iconColor: 'rgba(255,255,255,0.8)'
                    }

                    // If substack => smaller icon
                    const iconSize =
                        config.label === 'Substack' ? { width: '1.75rem', height: '1.75rem', padding: '0.2rem' } : { width: '1.75rem', height: '1.75rem' }

                    return (
                        <button
                            key={idx}
                            onClick={() => window.open(item.url, '_blank')}
                            title={config.label}
                            className="p-2 rounded-full hover:opacity-80 transition-all"
                            style={{ backgroundColor: '#444' }}
                        >
                            <Icon icon={config.icon} style={{ color: config.iconColor, ...iconSize }} />
                        </button>
                    )
                })}
            </div>
        )
    }

    const renderMainCard = () => {
        if (!educator) return <p className="text-center mt-4">Loading educator...</p>

        return (
            <div className="!p-0 mx-4 mt-4 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 pb-16">
                {/* Cover */}
                {educator.coverPhotoUrl && (
                    <div className="relative w-full h-40 overflow-hidden rounded-b-2xl">
                        <img src={constructImageUrl(educator.coverPhotoUrl)} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

                        {/* Tab buttons bottom-left */}
                        <div className="absolute bottom-2 left-4 flex gap-2">
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
                    </div>
                )}

                {activeTab === 'overview' && (educator.avatarUrl || educator.name) && (
                    <div className="flex items-center gap-3 px-4 pt-4">
                        {educator.avatarUrl && (
                            <img
                                src={constructImageUrl(educator.avatarUrl)}
                                alt="Logo"
                                className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-800"
                            />
                        )}
                        {educator.name && <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{educator.name}</h2>}
                    </div>
                )}

                <div className="px-4">
                    {activeTab === 'overview' && (
                        <>
                            {/* Categories / Chains */}
                            {(educator.categories?.length || 0) > 0 || (educator.chains?.length || 0) > 0 ? (
                                <Block className="mt-3 !p-0">
                                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">About:</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {educator.categories?.map((cat) => (
                                            <span key={cat.id} className="bg-blue-200 dark:bg-blue-700 text-2xs px-1 py-0.5 rounded-full">
                                                {cat.name}
                                            </span>
                                        ))}
                                        {educator.chains?.map((chain) => (
                                            <span key={chain.id} className="bg-green-200 dark:bg-green-700 text-2xs px-1 py-0.5 rounded-full">
                                                {chain.name}
                                            </span>
                                        ))}
                                    </div>
                                </Block>
                            ) : null}

                            {/* Bio */}
                            {educator.bio && (
                                <div className="mt-3">
                                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description:</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{educator.bio}</p>
                                </div>
                            )}

                            {/* Link icons */}
                            {renderLinkButtons()}
                        </>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">Tasks</h2>
                            <p>No tasks yet!</p>
                        </div>
                    )}

                    <div className="mt-6 mb-4">
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

    return (
        <Page className="overflow-auto">
            <Navbar />
            <Sidebar />

            {renderMainCard()}

            <BottomTabBar activeTab="tab-1" setActiveTab={() => {}} />
        </Page>
    )
}

export default EducatorDetailPage
