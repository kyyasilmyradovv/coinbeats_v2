// src/store/useLeaderboardStore.ts

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
    setLeaderboard: (leaderboard: LeaderboardEntry[]) => void
    setWeeklyLeaderboard: (weeklyLeaderboard: LeaderboardEntry[]) => void
    fetchLeaderboards: () => Promise<void>
}

const useLeaderboardStore = create<LeaderboardState>()(
    devtools((set) => ({
        leaderboard: [],
        weeklyLeaderboard: [],
        setLeaderboard: (leaderboard) => set({ leaderboard }),
        setWeeklyLeaderboard: (weeklyLeaderboard) => set({ weeklyLeaderboard }),

        fetchLeaderboards: async () => {
            try {
                // Fetch overall leaderboard
                const overallResponse = await axiosInstance.get('/api/points/leaderboard')
                set({ leaderboard: overallResponse.data })

                // Fetch weekly leaderboard
                const weeklyResponse = await axiosInstance.get('/api/points/leaderboard?period=weekly')
                set({ weeklyLeaderboard: weeklyResponse.data })
            } catch (error) {
                console.error('Error fetching leaderboards:', error)
            }
        }
    }))
)

export default useLeaderboardStore
