// src/pages/TelegramGroupDetailPage.tsx

import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Page, Card, Block, Button } from 'konsta/react'
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

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {group ? (
                <Card className="m-4 p-4 rounded-xl shadow-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600">
                    <h2 className="text-xl font-bold mb-2">{group.name}</h2>

                    <div className="flex items-center gap-4">
                        {group.logoUrl && <img src={constructImageUrl(group.logoUrl)} alt={group.name} className="w-24 h-24 rounded-full object-cover" />}
                        {group.coverPhotoUrl && <img src={constructImageUrl(group.coverPhotoUrl)} alt="cover" className="w-32 h-32 object-cover rounded-lg" />}
                    </div>

                    {group.description && <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">{group.description}</p>}

                    <Block className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        {group.telegramUrl && <p>Telegram URL: {group.telegramUrl}</p>}
                    </Block>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {group.categories?.map((cat) => (
                            <span key={cat.id} className="bg-blue-200 dark:bg-blue-700 text-xs px-2 py-1 rounded-full">
                                {cat.name}
                            </span>
                        ))}
                        {group.chains?.map((ch) => (
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
                <p className="text-center mt-4">Loading Telegram Group...</p>
            )}

            <BottomTabBar activeTab="tab-1" setActiveTab={() => {}} />
        </Page>
    )
}

export default TelegramGroupDetailPage
