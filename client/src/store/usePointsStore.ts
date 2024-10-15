// src/store/usePointsStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'
import useUserStore from './useUserStore'

interface Point {
    id: number
    userId: number
    value: number
    description?: string
    createdAt: string
}

interface PointsState {
    userPoints: Point[]
    setUserPoints: (points: Point[]) => void
    fetchUserPoints: () => Promise<void>
}

const usePointsStore = create<PointsState>()(
    devtools((set) => ({
        userPoints: [],
        setUserPoints: (points) => set({ userPoints: points }),

        fetchUserPoints: async () => {
            const { userId } = useUserStore.getState()
            if (!userId) {
                console.error('User ID is null or undefined, not fetching user points.')
                return
            }

            try {
                const response = await axiosInstance.get(`/api/points/breakdown/${userId}`)
                set({ userPoints: response.data })
            } catch (error) {
                console.error('Error fetching user points:', error)
            }
        }
    }))
)

export default usePointsStore
