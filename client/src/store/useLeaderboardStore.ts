import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

interface LeaderboardEntry {
    userId: number
    name: string
    totalPoints: number
}

interface LeaderboardState {
    leaderboard: LeaderboardEntry[]
    weeklyLeaderboard: LeaderboardEntry[]
    scholarshipText: string
    setLeaderboard: (leaderboard: LeaderboardEntry[]) => void
    setWeeklyLeaderboard: (weeklyLeaderboard: LeaderboardEntry[]) => void
    setScholarshipText: (text: string) => void
    fetchLeaderboards: () => Promise<void>
    fetchScholarshipText: () => Promise<void>
}

const useLeaderboardStore = create<LeaderboardState>()(
    devtools((set) => ({
        leaderboard: [],
        weeklyLeaderboard: [],
        scholarshipText: '',

        setLeaderboard: (leaderboard) => set({ leaderboard }),
        setWeeklyLeaderboard: (weeklyLeaderboard) => set({ weeklyLeaderboard }),
        setScholarshipText: (text) => set({ scholarshipText: text }),

        fetchLeaderboards: async () => {
            try {
                const overallResponse = await axiosInstance.get('/api/points/leaderboard')
                set({ leaderboard: overallResponse.data })

                const weeklyResponse = await axiosInstance.get('/api/points/leaderboard?period=weekly')
                set({ weeklyLeaderboard: weeklyResponse.data })
            } catch (error) {
                console.error('Error fetching leaderboards:', error)
            }
        },

        fetchScholarshipText: async () => {
            try {
                const response = await axiosInstance.get('/api/settings/scholarship_text')
                set({ scholarshipText: response.data.value })
            } catch (error) {
                console.error('Error fetching scholarship text:', error)
            }
        }
    }))
)

export default useLeaderboardStore
