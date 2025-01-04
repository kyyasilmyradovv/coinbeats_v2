// src/pages/YoutubeChannelDetailPage.tsx

import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Page, Card, Block, Button } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import useDiscoverStore from '../store/useDiscoverStore'

interface YoutubeChannel {
    id: number
    name: string
    description?: string
    youtubeUrl?: string
    logoUrl?: string
    coverPhotoUrl?: string
    categories?: { id: number; name: string }[]
    chains?: { id: number; name: string }[]
}

const YoutubeChannelDetailPage: React.FC = () => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const [channel, setChannel] = useState<YoutubeChannel | null>(null)

    const { youtubeChannels, fetchYoutubeChannels } = useDiscoverStore()

    useEffect(() => {
        const stateItem = location.state?.item as YoutubeChannel | undefined
        if (stateItem) {
            setChannel(stateItem)
        } else {
            if (youtubeChannels.length === 0) {
                fetchYoutubeChannels().then(() => {
                    const found = youtubeChannels.find((y) => y.id === Number(id))
                    if (found) setChannel(found)
                })
            } else {
                const found = youtubeChannels.find((y) => y.id === Number(id))
                if (found) setChannel(found)
            }
        }
    }, [id, location.state, youtubeChannels, fetchYoutubeChannels])

    const constructImageUrl = (url?: string) => (url ? `https://telegram.coinbeats.xyz/${url}` : '')

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {channel ? (
                <Card className="m-4 p-4 rounded-xl shadow-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600">
                    <h2 className="text-xl font-bold mb-2">{channel.name}</h2>

                    <div className="flex items-center gap-4">
                        {channel.logoUrl && <img src={constructImageUrl(channel.logoUrl)} alt={channel.name} className="w-24 h-24 rounded-full object-cover" />}
                        {channel.coverPhotoUrl && (
                            <img src={constructImageUrl(channel.coverPhotoUrl)} alt="cover" className="w-32 h-32 object-cover rounded-lg" />
                        )}
                    </div>

                    {channel.description && <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">{channel.description}</p>}

                    <Block className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        {channel.youtubeUrl && <p>Channel URL: {channel.youtubeUrl}</p>}
                    </Block>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {channel.categories?.map((cat) => (
                            <span key={cat.id} className="bg-blue-200 dark:bg-blue-700 text-xs px-2 py-1 rounded-full">
                                {cat.name}
                            </span>
                        ))}
                        {channel.chains?.map((ch) => (
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
                <p className="text-center mt-4">Loading YouTube Channel...</p>
            )}

            <BottomTabBar activeTab="tab-1" setActiveTab={() => {}} />
        </Page>
    )
}

export default YoutubeChannelDetailPage
