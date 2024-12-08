// src/store/useRafflesStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'
import useUserStore from './useUserStore'

interface Raffle {
    id: number
    userId: number
    amount: number
    desc?: string
    createdAt: string
}

interface RafflesState {
    userRaffles: Raffle[]
    setUserRaffles: (raffles: Raffle[]) => void
    fetchUserRaffles: () => Promise<void>
}

const useRafflesStore = create<RafflesState>()(
    devtools((set) => ({
        userRaffles: [],
        setUserRaffles: (raffles) => set({ userRaffles: raffles }),

        fetchUserRaffles: async () => {
            const { userId } = useUserStore.getState()
            if (!userId) {
                console.error('User ID is null or undefined, not fetching user raffles.')
                return
            }

            try {
                const response = await axiosInstance.get(`/api/raffle?userId=${userId}`)
                set({ userRaffles: response.data })
            } catch (error) {
                console.error('Error fetching user raffles:', error)
            }
        }
    }))
)

export default useRafflesStore
