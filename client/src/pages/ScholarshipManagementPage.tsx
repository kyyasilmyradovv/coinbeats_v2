// ScholarshipManagementPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, BlockTitle, List, ListInput, Button, Card, ListItem } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import useLeaderboardStore from '../store/useLeaderboardStore'
import axiosInstance from '../api/axiosInstance'

const ScholarshipManagementPage: React.FC = () => {
    const [scholarshipText, setScholarshipText] = useState('')
    const [loading, setLoading] = useState(true)
    const [weeklySnapshots, setWeeklySnapshots] = useState<string[]>([])
    const [selectedWeek, setSelectedWeek] = useState<string | null>(null)
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<any[]>([])

    const fetchScholarshipText = useLeaderboardStore((state) => state.fetchScholarshipText)
    const storedScholarshipText = useLeaderboardStore((state) => state.scholarshipText)
    const setStoreScholarshipText = useLeaderboardStore((state) => state.setScholarshipText)

    useEffect(() => {
        const fetchData = async () => {
            await fetchScholarshipText()
            setScholarshipText(storedScholarshipText)
            setLoading(false)
        }
        fetchData()
    }, [fetchScholarshipText, storedScholarshipText])

    const handleSave = async () => {
        try {
            const response = await axiosInstance.put('/api/settings/scholarship-text', { value: scholarshipText })
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

    const handleWeekClick = async (weekDate: string) => {
        setSelectedWeek(weekDate)
        try {
            const response = await axiosInstance.get(`/api/points/weekly_leaderboard_snapshot?week=${weekDate}`)
            setWeeklyLeaderboard(response.data)
        } catch (error) {
            console.error('Error fetching leaderboard for the week:', error)
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
                        <h2>Leaderboard for week starting {selectedWeek}</h2>
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
