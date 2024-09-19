// client/src/pages/GamesPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, BlockTitle, Card, Button } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import axios from '../api/axiosInstance'
import { Icon } from '@iconify/react'

interface VerificationTask {
    id: number
    name: string
    description: string
    xp: number
    platform: string
    verificationMethod: string
}

export default function GamesPage() {
    const [activeTab, setActiveTab] = useState('tab-3')
    const [tasks, setTasks] = useState<VerificationTask[]>([])

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('/api/verification-tasks/games')
                setTasks(response.data)
            } catch (error) {
                console.error('Error fetching tasks:', error)
            }
        }

        fetchTasks()
    }, [])

    const handleAction = (task: VerificationTask) => {
        if (task.verificationMethod === 'TWEET') {
            const tweetText = encodeURIComponent(task.description)
            window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
        }
        // Handle other actions...
    }

    function handleVerify(task: VerificationTask) {
        if (task.verificationMethod === 'TWEET') {
            const twitterHandle = prompt('Please enter your Twitter handle (without @):')
            if (twitterHandle) {
                axios
                    .post('/api/users/complete-task', { taskId: task.id, twitterHandle })
                    .then((response) => {
                        alert(response.data.message)
                    })
                    .catch((error) => {
                        console.error('Error verifying task:', error)
                        alert(error.response?.data?.message || 'Verification failed')
                    })
            }
        } else {
            // Handle other verification methods
        }
    }
    return (
        <Page>
            <Navbar />
            <Sidebar />
            <div className="text-center flex w-full items-center justify-center absolute top-8">
                <BlockTitle large>Earn</BlockTitle>
            </div>

            <div className="mt-16 px-4">
                {tasks.map((task) => (
                    <Card key={task.id} className="mb-4 p-4 rounded-2xl shadow-lg flex items-center">
                        <img src={`/images/platform-logos/${task.platform.toLowerCase()}.png`} alt={task.platform} className="w-12 h-12 mr-4" />
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{task.name}</h3>
                            <p>{task.description}</p>
                            <div className="flex items-center mt-2">
                                <Icon icon="mdi:coin" className="w-5 h-5 text-yellow-500" />
                                <span className="ml-1 text-sm text-gray-700">{task.xp} XP</span>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Button rounded onClick={() => handleAction(task)}>
                                Action
                            </Button>
                            <Button rounded onClick={() => handleVerify(task)}>
                                Verify
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </Page>
    )
}
