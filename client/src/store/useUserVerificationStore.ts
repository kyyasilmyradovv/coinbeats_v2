// src/store/useUserVerificationStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'
import useUserStore from './useUserStore'

interface UserVerificationTask {
    id: number
    userId: number
    verificationTaskId: number
    verified: boolean
    createdAt: string
    completedAt: string | null
}

interface UserVerificationState {
    userVerificationTasks: UserVerificationTask[]
    fetchUserVerificationTasks: () => Promise<void>
    startTask: (taskId: number) => Promise<void>
    submitTask: (taskId: number, submissionText: string) => Promise<void>
    completeTask: (taskId: number) => Promise<string>
}

const useUserVerificationStore = create<UserVerificationState>()(
    devtools((set, get) => ({
        userVerificationTasks: [],
        fetchUserVerificationTasks: async () => {
            const { userId } = useUserStore.getState()
            if (!userId) {
                console.error('User ID is null or undefined, not fetching user verification tasks.')
                return
            }

            try {
                const response = await axiosInstance.post('/api/users/verification-tasks', { userId })
                set({ userVerificationTasks: response.data })
            } catch (error) {
                console.error('Error fetching user verification tasks:', error)
            }
        },
        startTask: async (taskId) => {
            const { userId } = useUserStore.getState()
            if (!userId) {
                console.error('User not authenticated.')
                throw new Error('User not authenticated.')
            }

            try {
                await axiosInstance.post('/api/users/start-task', { taskId, userId })
            } catch (error) {
                console.error('Error starting task:', error)
                throw error
            }
        },
        submitTask: async (taskId, submissionText) => {
            const { userId } = useUserStore.getState()
            if (!userId) {
                console.error('User not authenticated.')
                throw new Error('User not authenticated.')
            }

            try {
                await axiosInstance.post('/api/users/submit-task', { taskId, submissionText, userId })
            } catch (error) {
                console.error('Error submitting task:', error)
                throw error
            }
        },
        completeTask: async (taskId) => {
            const { userId } = useUserStore.getState()
            if (!userId) {
                console.error('User not authenticated.')
                throw new Error('User not authenticated.')
            }

            try {
                const response = await axiosInstance.post('/api/users/complete-task', { taskId, userId })
                const { message, point } = response.data

                if (point) {
                    const { totalPoints } = useUserStore.getState()
                    useUserStore.setState({ totalPoints: totalPoints + point.value })
                }

                // Refresh user verification tasks
                await get().fetchUserVerificationTasks()

                return message
            } catch (error) {
                console.error('Error completing task:', error)
                throw error
            }
        }
    }))
)

export default useUserVerificationStore
