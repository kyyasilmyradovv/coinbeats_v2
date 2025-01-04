// src/pages/EducatorDetailPage.tsx

import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Page, Card, Block, Button } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import useDiscoverStore from '../store/useDiscoverStore'

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
    categories?: { id: number; name: string }[]
    chains?: { id: number; name: string }[]
}

const EducatorDetailPage: React.FC = () => {
    const { id } = useParams() // "id" from URL
    const location = useLocation()
    const navigate = useNavigate()

    const [educator, setEducator] = useState<Educator | null>(null)

    // We can fetch from store
    const { educators, fetchEducators } = useDiscoverStore()

    useEffect(() => {
        // First, try location.state
        const stateItem = location.state?.item as Educator | undefined
        if (stateItem) {
            setEducator(stateItem)
        } else {
            // If not found in state, fetch from store
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

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {educator ? (
                <Card className="m-4 p-4 rounded-xl shadow-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600">
                    <h2 className="text-xl font-bold mb-2">{educator.name}</h2>

                    <div className="flex items-center gap-4">
                        {educator.avatarUrl && (
                            <img src={constructImageUrl(educator.avatarUrl)} alt={educator.name} className="w-24 h-24 rounded-full object-cover" />
                        )}
                        {educator.coverPhotoUrl && (
                            <img src={constructImageUrl(educator.coverPhotoUrl)} alt="cover" className="w-32 h-32 object-cover rounded-lg" />
                        )}
                    </div>

                    {educator.bio && <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">{educator.bio}</p>}

                    <Block className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        {educator.youtubeUrl && <p>YouTube: {educator.youtubeUrl}</p>}
                        {educator.twitterUrl && <p>Twitter: {educator.twitterUrl}</p>}
                        {educator.telegramUrl && <p>Telegram: {educator.telegramUrl}</p>}
                        {educator.discordUrl && <p>Discord: {educator.discordUrl}</p>}
                    </Block>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {educator.categories?.map((cat) => (
                            <span key={cat.id} className="bg-blue-200 dark:bg-blue-700 text-xs px-2 py-1 rounded-full">
                                {cat.name}
                            </span>
                        ))}
                        {educator.chains?.map((chain) => (
                            <span key={chain.id} className="bg-green-200 dark:bg-green-700 text-xs px-2 py-1 rounded-full">
                                {chain.name}
                            </span>
                        ))}
                    </div>

                    <Button outline rounded className="mt-4" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                </Card>
            ) : (
                <p className="text-center mt-4">Loading educator...</p>
            )}

            <BottomTabBar activeTab="tab-1" setActiveTab={() => {}} />
        </Page>
    )
}

export default EducatorDetailPage
