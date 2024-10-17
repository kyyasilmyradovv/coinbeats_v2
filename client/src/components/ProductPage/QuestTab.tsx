// client/src/components/ProductPage/QuestTab.tsx

import React, { useState, useEffect } from 'react'
import { Block, Preloader } from 'konsta/react'
import { FaTwitter, FaFacebook, FaInstagram, FaTelegramPlane, FaDiscord, FaYoutube, FaEnvelope } from 'react-icons/fa'
import axiosInstance from '../../api/axiosInstance'
import coinbeats from '../../images/coinbeats-l.svg'

interface QuestTabProps {
    academy: any
}

// Platform Icons used in QuestTab and other components
const platformIcons: { [key: string]: JSX.Element } = {
    X: <FaTwitter className="w-8 h-8 !mb-3 text-blue-500 !p-0 !m-0" />,
    FACEBOOK: <FaFacebook className="w-8 h-8 !mb-3 text-blue-700 !p-0 !m-0" />,
    INSTAGRAM: <FaInstagram className="w-8 h-8 !mb-3 text-pink-500 !p-0 !m-0" />,
    TELEGRAM: <FaTelegramPlane className="w-8 h-8 !mb-3 text-blue-400 !p-0 !m-0" />,
    DISCORD: <FaDiscord className="w-8 h-8 !mb-3 text-indigo-600 !p-0 !m-0" />,
    YOUTUBE: <FaYoutube className="w-8 h-8 !mb-3 text-red-600 !p-0 !m-0" />,
    EMAIL: <FaEnvelope className="w-8 h-8 !mb-3 text-green-500 !p-0 !m-0" />,
    NONE: <img src={coinbeats} alt="CoinBeats" className="w-8 h-8 !mb-3" />
    // Add other platforms as needed
}

const QuestTab: React.FC<QuestTabProps> = ({ academy }) => {
    const [quests, setQuests] = useState<any[]>([])
    const [loadingQuests, setLoadingQuests] = useState(true)

    useEffect(() => {
        const fetchQuests = async () => {
            try {
                const response = await axiosInstance.get(`/api/verification-tasks/academy/${academy.id}`)
                setQuests(response.data || [])
            } catch (error) {
                console.error('Error fetching quests:', error)
                setQuests([])
            } finally {
                setLoadingQuests(false)
            }
        }

        fetchQuests()
    }, [academy.id])

    return (
        <Block className="!m-0 !p-0">
            {loadingQuests ? (
                <div className="flex justify-center items-center mt-4">
                    <Preloader size="w-12 h-12" />
                </div>
            ) : quests.length > 0 ? (
                quests.map((quest) => (
                    <div key={quest.id} className="quest-card">
                        {/* Quest content */}
                    </div>
                ))
            ) : (
                <div className="text-center text-white mt-4">No quests available.</div>
            )}
        </Block>
    )
}

export default QuestTab
