import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Page, Block } from 'konsta/react'
import { Icon } from '@iconify/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import useDiscoverStore from '../store/useDiscoverStore'
import { extractYouTubeVideoId } from '../utils/extractYouTubeVideoId'

interface Tutorial {
    id: number
    title: string
    description?: string
    contentUrl?: string
    type?: string
    logoUrl?: string
    coverPhotoUrl?: string
    categories?: { id: number; name: string }[]
    chains?: { id: number; name: string }[]
}

const typeMapping: { [key: string]: string } = {
    WALLET_SETUP: 'Wallet Setup',
    CEX_TUTORIAL: 'CEX Tutorial',
    APP_TUTORIAL: 'App Tutorial',
    RESEARCH_TUTORIAL: 'Research Tutorial',
    OTHER: 'Other'
}

const TutorialDetailPage: React.FC = () => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const [tutorial, setTutorial] = useState<Tutorial | null>(null)
    const { tutorials, fetchTutorials } = useDiscoverStore()

    const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview')

    useEffect(() => {
        const stateItem = location.state?.item as Tutorial | undefined
        if (stateItem) {
            setTutorial(stateItem)
        } else {
            if (tutorials.length === 0) {
                fetchTutorials().then(() => {
                    const found = tutorials.find((t) => t.id === Number(id))
                    if (found) setTutorial(found)
                })
            } else {
                const found = tutorials.find((t) => t.id === Number(id))
                if (found) setTutorial(found)
            }
        }
    }, [id, location.state, tutorials, fetchTutorials])

    const constructImageUrl = (url?: string) => (url ? `https://telegram.coinbeats.xyz/${url}` : '')

    const renderLinkButtons = () => {
        if (!tutorial?.contentUrl) return null

        const youtubeVideoId = extractYouTubeVideoId(tutorial.contentUrl)
        const isYouTubeLink = Boolean(youtubeVideoId)

        return (
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => window.open(tutorial.contentUrl, '_blank')}
                        className="p-2 rounded-full hover:opacity-80 transition-all"
                        style={{ backgroundColor: '#444' }}
                        title="Open Tutorial Link"
                    >
                        <Icon icon="mdi:link-variant" style={{ color: 'rgba(255,255,255,0.8)' }} className="w-8 h-8" />
                    </button>
                </div>
                {isYouTubeLink && (
                    <div className="mt-4">
                        <iframe
                            width="100%"
                            height="315"
                            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                            title="YouTube Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}
            </div>
        )
    }

    const renderMainCard = () => {
        if (!tutorial) return <p className="text-center mt-4">Loading tutorial...</p>

        return (
            <div className="!p-0 mx-4 mt-4 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 !mb-20">
                {tutorial.coverPhotoUrl && (
                    <div className="relative w-full h-40 overflow-hidden rounded-b-2xl">
                        <img src={constructImageUrl(tutorial.coverPhotoUrl)} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

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

                {activeTab === 'overview' && (tutorial.logoUrl || tutorial.title) && (
                    <div className="flex items-center gap-3 px-4 pt-4">
                        {tutorial.logoUrl && (
                            <img
                                src={constructImageUrl(tutorial.logoUrl)}
                                alt="Logo"
                                className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-800"
                            />
                        )}
                        {tutorial.title && <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{tutorial.title}</h2>}
                    </div>
                )}

                <div className="px-4">
                    {activeTab === 'overview' && (
                        <>
                            {(tutorial.categories?.length || 0) > 0 || (tutorial.chains?.length || 0) > 0 ? (
                                <Block className="mt-3 !p-0">
                                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">About:</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {tutorial.categories?.map((cat) => (
                                            <span key={cat.id} className="bg-blue-200 dark:bg-blue-700 text-2xs px-1 py-0.5 rounded-full">
                                                {cat.name}
                                            </span>
                                        ))}
                                        {tutorial.chains?.map((chain) => (
                                            <span key={chain.id} className="bg-green-200 dark:bg-green-700 text-2xs px-1 py-0.5 rounded-full">
                                                {chain.name}
                                            </span>
                                        ))}
                                    </div>
                                </Block>
                            ) : null}

                            {tutorial.description && (
                                <div className="mt-3">
                                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description:</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{tutorial.description}</p>
                                </div>
                            )}

                            {renderLinkButtons()}

                            {tutorial.type && (
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    <strong>Type:</strong> {typeMapping[tutorial.type] || tutorial.type}
                                </div>
                            )}
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

export default TutorialDetailPage
