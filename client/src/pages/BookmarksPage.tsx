// src/pages/BookmarksPage.js

import React, { useEffect, useState } from 'react'
import { Page, Button } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import coins from '../images/coin-stack.png'
import ticket from '../images/ticket.png'
import moneyBag from '../images/money-bag.png'
import calendar from '../images/calendar.png'
import cash from '../images/cash.png'
import aurelius from '../images/aurelius.png'
import aarna from '../images/aarna.png'
import skale from '../images/skale.png'
import clip from '../images/clip.png'
import coinbeats from '../images/coinbeats-l.svg'
import coming from '../images/svgs/coming-soon3.svg'
import axiosInstance from '~/api/axiosInstance'
import useUserStore from '~/store/useUserStore'

interface AcademyInterface {
    name: string
    logoUrl: string
    nextRaffleDate: string
    reward: string
    winners: string
    remainingDays: number
    inMyRaffles: boolean
}

export default function BookmarksPage() {
    const { totalRaffles } = useUserStore()

    const [headerTab, setHeaderTab] = useState('all')
    const [activeTab, setActiveTab] = useState('tab-2')
    const [academies, setAcademies] = useState<AcademyInterface[]>([])

    useEffect(() => {
        const fetchCoinBeatsRaffle = async () => {
            try {
                const response = await axiosInstance.get('/api/raffle/overall')

                const today = new Date()
                const deadline = new Date(response.data?.deadline)

                setAcademies([
                    {
                        name: 'CoinBeats',
                        logoUrl: coinbeats,
                        nextRaffleDate: deadline.toLocaleDateString(),
                        reward: response.data?.reward,
                        winners: `${response.data?.winnersCount} x ${response.data?.reward}`,
                        remainingDays: Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
                        inMyRaffles: true
                    }
                ])
            } catch (error) {
                console.error('Error fetching overall raffle:', error)
            }
        }

        fetchCoinBeatsRaffle()
    }, [])

    // Filter academies based on active tab
    const filteredAcademies = academies?.filter((academy) => headerTab === 'all' || (headerTab === 'my' && academy.inMyRaffles))

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover">
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
                <div className="relative z-10">
                    {/* Tabs */}
                    <div className="flex justify-center gap-2 mt-4 mx-4 relative z-10 px-4 pt-4 mb-2">
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
                    </div>

                    {/* Coming Soon Sign Centered
                    <div className="flex items-center justify-center z-40 pointer-events-none mx-auto w-full mb-2">
                        <img src={coming} className="h-16 rotate-[3deg]" alt="Coming Soon" />
                    </div> */}

                    {/* Cards Layout */}
                    <div className="grid grid-cols-1 gap-4 px-4">
                        {filteredAcademies.map((academy, index) => (
                            <div
                                key={index}
                                className="p-1 flex flex-row items-center justify-between rounded-2xl shadow-lg bg-white dark:bg-zinc-900 bg-opacity-75 border border-gray-600"
                            >
                                {/* Academy Logo */}
                                <div className="flex-shrink-0 ml-2">
                                    <img alt={academy.name} className="h-16 w-16 rounded-full" src={academy.logoUrl} />
                                </div>

                                {/* Raffle Information */}
                                <div className="flex-grow text-left ml-4 text-white">
                                    <div className="flex font-bold text-sm items-center mt-1">
                                        <img src={ticket} className="h-7 w-7 mr-2" alt="Ticket icon" />
                                        {academy.name}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        <div className="flex text-gray-300">
                                            <img src={cash} className="h-5 w-5 mr-2" alt="Cash icon" /> {academy.winners}
                                        </div>
                                        <div className="flex text-gray-300">
                                            <img src={calendar} className="h-5 w-5 mr-2" alt="Calendar icon" /> {academy.nextRaffleDate}
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
                                            academy.inMyRaffles ? '!border-blue-400' : ''
                                        }`}
                                        style={{
                                            background: academy.inMyRaffles
                                                ? 'linear-gradient(to left, #16a34a, #3b82f6)' // Green to blue gradient
                                                : 'linear-gradient(to left, #ff0077, #7700ff)', // Purple gradient
                                            color: '#fff'
                                        }}
                                    >
                                        {index === 0 ? `${totalRaffles} Entries` : academy.inMyRaffles ? '5 Entries' : 'Join'}
                                    </Button>
                                    <div className="text-sm font-bold flex items-center">
                                        <img src={moneyBag} className="h-6 w-6 mr-1" alt="Money bag icon" /> {academy.reward}
                                    </div>
                                    <div className="mt-1 text-xs text-purple-400">{academy.remainingDays} days remaining</div>
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
