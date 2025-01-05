// src/pages/PodcastDetailPage.tsx

import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Page, Card, Block } from 'konsta/react'
import { Icon } from '@iconify/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import useDiscoverStore from '../store/useDiscoverStore'

interface Podcast {
    id: number
    name: string
    description?: string
    spotifyUrl?: string
    appleUrl?: string
    youtubeUrl?: string
    logoUrl?: string
    coverPhotoUrl?: string
    categories?: { id: number; name: string }[]
    chains?: { id: number; name: string }[]
}

const PodcastDetailPage: React.FC = () => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const [podcast, setPodcast] = useState<Podcast | null>(null)
    const { podcasts, fetchPodcasts } = useDiscoverStore()

    // Tabs
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview')

    useEffect(() => {
        const stateItem = location.state?.item as Podcast | undefined
        if (stateItem) {
            setPodcast(stateItem)
        } else {
            if (podcasts.length === 0) {
                fetchPodcasts().then(() => {
                    const found = podcasts.find((p) => p.id === Number(id))
                    if (found) setPodcast(found)
                })
            } else {
                const found = podcasts.find((p) => p.id === Number(id))
                if (found) setPodcast(found)
            }
        }
    }, [id, location.state, podcasts, fetchPodcasts])

    const constructImageUrl = (url?: string) => (url ? `https://telegram.coinbeats.xyz/${url}` : '')

    // Subtle brand icon styling
    const linkIcons: Record<string, { icon: string; label: string; iconColor: string }> = {
        spotifyUrl: { icon: 'mdi:spotify', label: 'Spotify', iconColor: 'rgba(29,185,84,0.9)' },
        appleUrl: { icon: 'mdi:apple', label: 'Apple', iconColor: 'rgba(153,153,153,0.9)' },
        youtubeUrl: { icon: 'mdi:youtube', label: 'YouTube', iconColor: 'rgba(255,0,0,0.9)' }
    }

    const renderLinkButtons = () => {
        if (!podcast) return null
        const links = [
            { field: 'spotifyUrl', url: podcast.spotifyUrl },
            { field: 'appleUrl', url: podcast.appleUrl },
            { field: 'youtubeUrl', url: podcast.youtubeUrl }
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
                    return (
                        <button
                            key={idx}
                            onClick={() => window.open(item.url, '_blank')}
                            title={config.label}
                            className="p-2 rounded-full hover:opacity-80 transition-all"
                            style={{ backgroundColor: '#444' }}
                        >
                            <Icon icon={config.icon} style={{ color: config.iconColor }} className="w-8 h-8" />
                        </button>
                    )
                })}
            </div>
        )
    }

    const renderOverviewTab = () => {
        if (!podcast) return <p className="text-center mt-4">Loading podcast...</p>

        return (
            <div className="!p-0 mx-4 mt-4 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600">
                {/* Cover Photo */}
                {podcast.coverPhotoUrl && (
                    <div className="relative w-full h-40 overflow-hidden rounded-b-2xl">
                        <img src={constructImageUrl(podcast.coverPhotoUrl)} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    </div>
                )}

                {/* Logo + Name */}
                {(podcast.logoUrl || podcast.name) && (
                    <div className="flex items-center gap-3 px-4 pt-4">
                        {podcast.logoUrl && (
                            <img
                                src={constructImageUrl(podcast.logoUrl)}
                                alt="Logo"
                                className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-800"
                            />
                        )}
                        {podcast.name && <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{podcast.name}</h2>}
                    </div>
                )}

                <div className="px-4 pb-4">
                    {/* About */}
                    {(podcast.categories?.length || 0) > 0 || (podcast.chains?.length || 0) > 0 ? (
                        <Block className="mt-4 !p-0">
                            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">About:</h3>
                            <div className="flex flex-wrap gap-2">
                                {podcast.categories?.map((cat) => (
                                    <span key={cat.id} className="bg-blue-200 dark:bg-blue-700 text-xs px-2 py-1 rounded-full">
                                        {cat.name}
                                    </span>
                                ))}
                                {podcast.chains?.map((chain) => (
                                    <span key={chain.id} className="bg-green-200 dark:bg-green-700 text-xs px-2 py-1 rounded-full">
                                        {chain.name}
                                    </span>
                                ))}
                            </div>
                        </Block>
                    ) : null}

                    {/* Description */}
                    {podcast.description && (
                        <div className="mt-4">
                            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description:</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{podcast.description}</p>
                        </div>
                    )}

                    {/* Links */}
                    {renderLinkButtons()}

                    {/* Go Back */}
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
        <Page>
            <Navbar />
            <Sidebar />

            {/* Tabs */}
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

export default PodcastDetailPage
