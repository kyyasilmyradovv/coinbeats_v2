// src/pages/BookmarksPage.js

import React, { useEffect, useState } from 'react'
import { Page, Button, Preloader } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import ticket from '../images/ticket.png'
import moneyBag from '../images/money-bag.png'
import calendar from '../images/calendar.png'
import cash from '../images/cash.png'
import coinbeats from '../images/coinbeats-l.svg'
import axiosInstance from '~/api/axiosInstance'
import useUserStore from '~/store/useUserStore'
import { FaTimes } from 'react-icons/fa'
import RaffleCountdown from '~/components/RaffleCountdownComponent'

interface RaffleInterface {
    name: string
    logoUrl: string
    reward: string
    winners: string
    remainingDays: number
    deadline: string
    type: string
    raffleCount: string
    inMyRaffles: boolean
}

export default function BookmarksPage() {
    const { totalRaffles } = useUserStore()
    const [headerTab, setHeaderTab] = useState('all')
    const [activeTab, setActiveTab] = useState('tab-2')
    const [raffles, setRaffles] = useState<RaffleInterface[]>([])
    const [showTooltip, setShowTooltip] = useState(false)
    const { userId } = useUserStore((state) => ({ userId: state.userId }))
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchRaffles = async () => {
            try {
                setLoading(true)
                const response = await axiosInstance.get(`/api/raffle/overall-for-users?userId=${userId}`)

                const rafflesList = []
                const today = new Date()

                for (let r of response?.data) {
                    const deadline = new Date(r.deadline)
                    const remainingTime = deadline.getTime() - today.getTime()

                    // Calculate remaining days, hours, and minutes
                    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24))
                    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
                    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000)

                    const countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`

                    rafflesList.push({
                        ...r,
                        deadline: deadline.toLocaleString().split('T')[0],
                        winners: `${r?.winnersCount} x ${r?.reward}`,
                        countdown,
                        inMyRaffles: r.raffleCount > 0
                    })
                }

                if (rafflesList[0].type === 'PLATFORM') {
                    rafflesList[0].name = 'CoinBeats Platform'
                    rafflesList[0].inMyRaffles = true
                    rafflesList[0].raffleCount = totalRaffles
                }

                setRaffles(rafflesList)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching overall raffle:', error)
            }
        }

        if (!loading) {
            fetchRaffles()
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            const today = new Date()
            const updatedRaffles = raffles.map((raffle) => {
                const deadline = new Date(raffle.deadline)
                const remainingTime = deadline.getTime() - today.getTime()

                const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24))
                const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000)

                const countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`
                return { ...raffle, countdown }
            })

            setRaffles(updatedRaffles)
        }, 1000)

        return () => clearInterval(interval)
    }, [raffles])

    // Filter raffles based on active tab
    const filteredRaffles = raffles?.filter((raffle) => headerTab === 'all' || (headerTab === 'my' && raffle.inMyRaffles))

    const constructImageUrl = (url: string) => {
        return `https://telegram.coinbeats.xyz/${url}`
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />
            <div className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover">
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
                <div className="relative z-10">
                    {/* Tabs */}
                    <div className="flex flex-col justify-center gap-2 mt-1 mb-5 mx-4 relative z-10 px-4 pt-4 mb-2 items-center">
                        <div className="flex gap-2 items-center">
                            <Button
                                outline
                                rounded
                                onClick={() => setHeaderTab('all')}
                                className={`${
                                    headerTab === 'all' ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg' : 'bg-white dark:bg-gray-900 shadow-lg'
                                } rounded-full text-xs`}
                                style={{
                                    color: '#fff'
                                }}
                            >
                                All Raffles
                            </Button>

                            <Button
                                outline
                                rounded
                                onClick={() => setHeaderTab('my')}
                                className={`${
                                    headerTab === 'my' ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg' : 'bg-white dark:bg-gray-900 shadow-lg'
                                } rounded-full text-xs`}
                                style={{
                                    color: '#fff'
                                }}
                            >
                                My Raffles
                            </Button>

                            <button
                                className="rounded-full bg-gray-700 text-white text-xs font-bold w-12 h-6 items-center justify-center"
                                onClick={() => setShowTooltip(!showTooltip)}
                            >
                                ?
                            </button>
                        </div>

                        {showTooltip && (
                            <div className="flex bg-gray-700 text-xs rounded-2xl p-4 mt-2 shadow-lg w-fit">
                                <p>
                                    <p>The raffle entries are reset at the time when the raffle happens.</p>
                                    <p>
                                        You'll see all ongoing raffles under "All Raffles" tab, and you'll see all ongoing raffles where you have earned entries
                                        under "My Raffles".
                                    </p>
                                </p>
                                <button className="items-center p-1" onClick={() => setShowTooltip(false)}>
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Spinner */}
                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '12px' }}>
                            <Preloader />
                        </div>
                    )}

                    {/* Cards Layout */}
                    <div className="grid grid-cols-1 gap-4 px-4">
                        {filteredRaffles.map((raffle, index) => (
                            <div
                                key={index}
                                className="p-1 flex flex-row items-center justify-between rounded-2xl shadow-lg bg-white dark:bg-zinc-900 bg-opacity-75 border border-gray-600"
                            >
                                {/* raffle Logo */}
                                <div className="flex-shrink-0 ml-2">
                                    <img
                                        alt={raffle.name}
                                        className="h-16 w-16 rounded-full"
                                        src={raffle.type === 'PLATFORM' ? coinbeats : constructImageUrl(raffle.logoUrl)}
                                    />
                                </div>

                                {/* Raffle Information */}
                                <div className="flex-grow text-left ml-4 text-white">
                                    <div className="flex font-bold text-sm items-center mt-1">
                                        <img src={ticket} className="h-7 w-7 mr-2" alt="Ticket icon" />
                                        {raffle.name}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        <div className="flex text-gray-300">
                                            <img src={cash} className="h-5 w-5 mr-2" alt="Cash icon" /> {raffle.winners}
                                        </div>
                                        <div className="flex text-gray-300">
                                            <img src={calendar} className="h-5 w-5 mr-2" alt="Calendar icon" /> {raffle.deadline}
                                        </div>
                                    </div>
                                </div>

                                {/* Participate Button */}
                                <div className="flex flex-col flex-shrink-0 mr-2 justify-end text-end items-end">
                                    <Button
                                        rounded
                                        large
                                        outline
                                        className={`ml-1 font-bold text-2xs shadow-lg !w-20 !whitespace-nowrap !h-6 !px-2 !py-1 !mb-1 right-0 ${
                                            raffle.inMyRaffles ? '!border-blue-400' : ''
                                        }`}
                                        style={{
                                            background: raffle.inMyRaffles
                                                ? 'linear-gradient(to left, #16a34a, #3b82f6)'
                                                : 'linear-gradient(to left, #ff0077, #7700ff)',
                                            color: '#fff'
                                        }}
                                    >
                                        {+raffle.raffleCount > 0 ? `${raffle.raffleCount} Entries` : 'Join'}
                                    </Button>
                                    <div className="text-sm font-bold flex items-center">
                                        <img src={moneyBag} className="h-6 w-6 mr-1" alt="Money bag icon" /> {raffle.reward}
                                    </div>
                                    <RaffleCountdown raffle={raffle} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>
        </Page>
    )
}
