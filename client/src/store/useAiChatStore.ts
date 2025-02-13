// src/store/useAiChatStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

interface AiChat {
    id: number
    userId: number
    amount: number
    desc?: string
    createdAt: string
}

interface AiChatState {
    chatText: string
    // setUserAiChats: (aichats: AiChat[]) => void
    // fetchUserAiChats: () => Promise<void>
}

const useAiChatStore = create<AiChatState>()(
    devtools((set) => ({
        chatText: ''

        // setUserAiChats: (aichats) => set({ userAiChats: aichats }),

        // fetchUserAiChats: async () => {
        //     const { userId } = useUserStore.getState()
        //     if (!userId) {
        //         console.error('User ID is null or undefined, not fetching user aichats.')
        //         return
        //     }

        //     try {
        //         const response = await axiosInstance.get(`/api/aichat?userId=${userId}`)
        //         set({ userAiChats: response.data })
        //     } catch (error) {
        //         console.error('Error fetching user aichats:', error)
        //     }
        // }
    }))
)

export default useAiChatStore
