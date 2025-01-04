// src/pages/PodcastDetailPage.tsx

import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Page, Card, Block, Button } from 'konsta/react'
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

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {podcast ? (
                <Card className="m-4 p-4 rounded-xl shadow-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600">
                    <h2 className="text-xl font-bold mb-2">{podcast.name}</h2>

                    {podcast.coverPhotoUrl && (
                        <img src={constructImageUrl(podcast.coverPhotoUrl)} alt={podcast.name} className="w-full h-32 object-cover rounded-lg" />
                    )}

                    {podcast.description && <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">{podcast.description}</p>}

                    <Block className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        {podcast.spotifyUrl && <p>Spotify: {podcast.spotifyUrl}</p>}
                        {podcast.appleUrl && <p>Apple: {podcast.appleUrl}</p>}
                        {podcast.youtubeUrl && <p>YouTube: {podcast.youtubeUrl}</p>}
                    </Block>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {podcast.categories?.map((cat) => (
                            <span key={cat.id} className="bg-blue-200 dark:bg-blue-700 text-xs px-2 py-1 rounded-full">
                                {cat.name}
                            </span>
                        ))}
                        {podcast.chains?.map((ch) => (
                            <span key={ch.id} className="bg-green-200 dark:bg-green-700 text-xs px-2 py-1 rounded-full">
                                {ch.name}
                            </span>
                        ))}
                    </div>

                    <Button outline rounded className="mt-4" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                </Card>
            ) : (
                <p className="text-center mt-4">Loading podcast...</p>
            )}

            <BottomTabBar activeTab="tab-1" setActiveTab={() => {}} />
        </Page>
    )
}

export default PodcastDetailPage
