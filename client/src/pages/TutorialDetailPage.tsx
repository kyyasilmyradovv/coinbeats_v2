// src/pages/TutorialDetailPage.tsx

import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Page, Card, Block, Button } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import useDiscoverStore from '../store/useDiscoverStore'

interface Tutorial {
    id: number
    title: string
    description?: string
    contentUrl: string
    type: string
    logoUrl?: string
    coverPhotoUrl?: string
    categories?: { id: number; name: string }[]
    chains?: { id: number; name: string }[]
}

const TutorialDetailPage: React.FC = () => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const [tutorial, setTutorial] = useState<Tutorial | null>(null)

    const { tutorials, fetchTutorials } = useDiscoverStore()

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

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {tutorial ? (
                <Card className="m-4 p-4 rounded-xl shadow-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600">
                    <h2 className="text-xl font-bold mb-2">{tutorial.title}</h2>

                    {tutorial.coverPhotoUrl && (
                        <img src={constructImageUrl(tutorial.coverPhotoUrl)} alt={tutorial.title} className="w-full h-32 object-cover rounded-lg" />
                    )}

                    {tutorial.description && <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">{tutorial.description}</p>}

                    <Block className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p>Type: {tutorial.type}</p>
                        {tutorial.contentUrl && <p>Content URL: {tutorial.contentUrl}</p>}
                    </Block>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {tutorial.categories?.map((cat) => (
                            <span key={cat.id} className="bg-blue-200 dark:bg-blue-700 text-xs px-2 py-1 rounded-full">
                                {cat.name}
                            </span>
                        ))}
                        {tutorial.chains?.map((ch) => (
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
                <p className="text-center mt-4">Loading tutorial...</p>
            )}

            <BottomTabBar activeTab="tab-1" setActiveTab={() => {}} />
        </Page>
    )
}

export default TutorialDetailPage
