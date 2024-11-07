// ScholarshipManagementPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, BlockTitle, List, ListInput, Button, Card, ListItem } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import useLeaderboardStore from '../store/useLeaderboardStore'
import axiosInstance from '../api/axiosInstance'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { useInitData } from '@telegram-apps/sdk-react' // Import for Telegram SDK

const ScholarshipManagementPage: React.FC = () => {
    const [scholarshipText, setScholarshipText] = useState('')
    const [weeklySnapshots, setWeeklySnapshots] = useState<string[]>([])
    const [selectedWeek, setSelectedWeek] = useState<string | null>(null)
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<any[]>([])
    const [startOfWeek, setStartOfWeek] = useState<string | null>(null)
    const [endOfWeek, setEndOfWeek] = useState<string | null>(null)
    const [currentCETTime, setCurrentCETTime] = useState<Date>(new Date())
    const [countdown, setCountdown] = useState<string>('')
    const [selectedWalletType, setSelectedWalletType] = useState<string>('erc20WalletAddress')

    const fetchScholarshipText = useLeaderboardStore((state) => state.fetchScholarshipText)
    const storedScholarshipText = useLeaderboardStore((state) => state.scholarshipText)
    const setStoreScholarshipText = useLeaderboardStore((state) => state.setScholarshipText)

    const initData = useInitData() // Initialize Telegram Web App data

    useEffect(() => {
        const fetchData = async () => {
            await fetchScholarshipText()
            setScholarshipText(storedScholarshipText)
        }
        fetchData()
    }, [fetchScholarshipText, storedScholarshipText])

    const handleSave = async () => {
        try {
            const response = await axiosInstance.put('/api/settings/scholarship-text', {
                value: scholarshipText
            })
            setStoreScholarshipText(response.data.value)
            alert('Scholarship text updated successfully.')
        } catch (error) {
            console.error('Error updating scholarship text:', error)
            alert('Failed to update scholarship text.')
        }
    }

    useEffect(() => {
        const fetchWeeklySnapshots = async () => {
            try {
                const response = await axiosInstance.get('/api/points/weekly_snapshots')
                setWeeklySnapshots(response.data.snapshots)
            } catch (error) {
                console.error('Error fetching weekly snapshots:', error)
            }
        }
        fetchWeeklySnapshots()
    }, [])

    useEffect(() => {
        const timeZone = 'Europe/Berlin'
        const updateTime = () => {
            const nowUTC = new Date()
            const nowCET = utcToZonedTime(nowUTC, timeZone)
            setCurrentCETTime(nowCET)

            // Calculate time until next Saturday at 23:00 CET
            const nextSnapshot = getNextSnapshotTimeCET()
            const diff = nextSnapshot.getTime() - nowCET.getTime()

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setCountdown(`${hours}h ${minutes}m ${seconds}s`)
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)

        return () => clearInterval(interval)
    }, [])

    const getNextSnapshotTimeCET = () => {
        const timeZone = 'Europe/Berlin'

        const nowUTC = new Date()
        const nowCET = utcToZonedTime(nowUTC, timeZone)

        let nextSnapshotCET = new Date(nowCET)

        // Get day of the week (0=Sunday, ..., 6=Saturday)
        const day = nowCET.getDay()
        const hour = nowCET.getHours()

        if (day < 6 || (day === 6 && hour < 23)) {
            // This Saturday
            const daysUntilSaturday = 6 - day
            nextSnapshotCET.setDate(nowCET.getDate() + daysUntilSaturday)
        } else {
            // Next Saturday
            const daysUntilNextSaturday = 7 - day + 6
            nextSnapshotCET.setDate(nowCET.getDate() + daysUntilNextSaturday)
        }

        nextSnapshotCET.setHours(23, 0, 0, 0) // Set to 23:00 CET

        return nextSnapshotCET
    }

    const handleWeekClick = async (weekDate: string) => {
        setSelectedWeek(weekDate)

        // Parse weekDate as CET time
        const timeZone = 'Europe/Berlin'
        const weekDateCET = new Date(weekDate)

        // Get start and end of week
        const { startOfWeekCET, endOfWeekCET } = getWeekStartEndCET(weekDateCET)

        setStartOfWeek(format(startOfWeekCET, 'yyyy-MM-dd HH:mm:ss'))
        setEndOfWeek(format(endOfWeekCET, 'yyyy-MM-dd HH:mm:ss'))

        try {
            const response = await axiosInstance.get(`/api/points/weekly_leaderboard_snapshot?week=${encodeURIComponent(weekDate)}`)
            setWeeklyLeaderboard(response.data)
        } catch (error) {
            console.error('Error fetching leaderboard for the week:', error)
        }
    }

    const getWeekStartEndCET = (date: Date) => {
        const timeZone = 'Europe/Berlin'

        // date is in CET already
        const zonedDate = date

        // Get previous Saturday at 23:00 CET
        let day = zonedDate.getDay() // 0 (Sunday) to 6 (Saturday)
        let diff = (day + 1) % 7 // Days since Saturday

        let startOfWeekCET = new Date(zonedDate)
        startOfWeekCET.setDate(zonedDate.getDate() - diff)
        startOfWeekCET.setHours(23, 0, 0, 0) // Set to 23:00 CET

        let endOfWeekCET = new Date(startOfWeekCET)
        endOfWeekCET.setDate(endOfWeekCET.getDate() + 7)
        endOfWeekCET.setMilliseconds(-1)

        return { startOfWeekCET, endOfWeekCET }
    }

    const handleDownloadCSV = async () => {
        if (!weeklyLeaderboard || weeklyLeaderboard.length === 0) {
            alert('No data to download.')
            return
        }

        const csvData = weeklyLeaderboard.map((user, index) => ({
            Rank: index + 1,
            username: user.name,
            userId: user.userId,
            telegramUserId: user.telegramUserId,
            walletAddress: user[selectedWalletType] || ''
        }))

        const csvContent = [
            'Rank,Username,UserId,TelegramUserId,WalletAddress',
            ...csvData.map((row) => `${row.Rank},${row.username},${row.userId},${row.telegramUserId},${row.walletAddress}`)
        ].join('\n')

        try {
            // Send CSV data to the server
            const response = await axiosInstance.post('/api/download-csv', {
                csvContent,
                fileName: `${selectedWeek?.replace(/[: ]/g, '_')}_snapshot.csv`
            })

            const { downloadUrl } = response.data

            // Use Telegram SDK to open the link in an external browser
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) {
                window.Telegram.WebApp.openLink(downloadUrl)
            } else {
                // Fallback if Telegram SDK is not available
                window.open(downloadUrl, '_blank')
            }
        } catch (error) {
            console.error('Error downloading CSV:', error)
            alert('Failed to download CSV.')
        }
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />
            <div className="mt-16">
                <BlockTitle large>Scholarship Management</BlockTitle>
                <List strong inset>
                    <ListInput
                        label="Scholarship Text"
                        type="textarea"
                        outline
                        value={scholarshipText}
                        onChange={(e) => setScholarshipText(e.target.value)}
                        placeholder="Enter scholarship text"
                    />
                </List>
                <Button large rounded onClick={handleSave} className="!w-[90%] !mx-auto">
                    Save
                </Button>
                <BlockTitle large>Weekly Leaderboard Snapshots</BlockTitle>
                <List strong inset>
                    {weeklySnapshots.map((weekDate) => (
                        <ListItem key={weekDate} title={weekDate} link onClick={() => handleWeekClick(weekDate)} />
                    ))}
                </List>
                {selectedWeek && (
                    <Card className="mt-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xs text-gray-300">Leaderboard for week starting:</h2>
                            <h2 className="text-md text-white"> {selectedWeek}</h2>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-300">Start:</p>
                            <p className="text-md text-white">{startOfWeek}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-300">End:</p>
                            <p className="text-md text-white">{endOfWeek}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-300">Current CET Time:</p>
                            <p className="text-md text-white">{format(currentCETTime, 'yyyy-MM-dd HH:mm:ss')} CET</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-300">Countdown to next snapshot:</p>
                            <p className="text-md text-white">{countdown}</p>
                        </div>
                        <List strong inset className="!m-0 !p-0">
                            <ListInput
                                outline
                                label="Select Wallet"
                                type="select"
                                className="!m-0 !p-0"
                                value={selectedWalletType}
                                onChange={(e) => setSelectedWalletType(e.target.value)}
                            >
                                <option value="erc20WalletAddress">ERC20 Wallet Address</option>
                                <option value="solanaWalletAddress">Solana Wallet Address</option>
                                <option value="tonWalletAddress">TON Wallet Address</option>
                            </ListInput>
                        </List>
                        <Button large rounded onClick={handleDownloadCSV} className="!w-[90%] !mx-auto">
                            Download .csv
                        </Button>
                        <List strong inset>
                            {weeklyLeaderboard.map((user, index) => (
                                <ListItem key={user.userId} title={`${index + 1}. ${user.name} - ${user.totalPoints}`} />
                            ))}
                        </List>
                    </Card>
                )}
            </div>
        </Page>
    )
}

export default ScholarshipManagementPage
