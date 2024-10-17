// src/store/useTasksStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

interface VerificationTask {
    id: number
    name: string
    description: string
    xp: number
    platform: string
    verificationMethod: string
    intervalType: string
    shortCircuit: boolean
    shortCircuitTimer: number | null
}

interface TasksState {
    homepageTasks: VerificationTask[]
    gameTasks: VerificationTask[]
    academyTasks: VerificationTask[]
    setHomepageTasks: (tasks: VerificationTask[]) => void
    setGameTasks: (tasks: VerificationTask[]) => void
    setAcademyTasks: (tasks: VerificationTask[]) => void
    fetchHomepageTasks: () => Promise<void>
    fetchGameTasks: () => Promise<void>
    fetchVerificationTasks: () => Promise<void>
    fetchAcademyVerificationTasks: (academyId: number) => Promise<void>
}

const useTasksStore = create<TasksState>()(
    devtools((set) => ({
        homepageTasks: [],
        gameTasks: [],
        academyTasks: [],
        setHomepageTasks: (tasks) => set({ homepageTasks: tasks }),
        setGameTasks: (tasks) => set({ gameTasks: tasks }),
        setAcademyTasks: (tasks) => set({ academyTasks: tasks }),

        // Fetches homepage verification tasks
        fetchHomepageTasks: async () => {
            try {
                // Endpoint: GET /api/verification-tasks/homepage
                const response = await axiosInstance.get('/api/verification-tasks/homepage')
                set({ homepageTasks: response.data })
            } catch (error) {
                console.error('Error fetching homepage tasks:', error)
            }
        },

        // Fetches game verification tasks
        fetchGameTasks: async () => {
            try {
                // Endpoint: GET /api/verification-tasks/games
                const response = await axiosInstance.get('/api/verification-tasks/games')
                set({ gameTasks: response.data })
            } catch (error) {
                console.error('Error fetching game tasks:', error)
            }
        },

        // Fetches all verification tasks
        fetchVerificationTasks: async () => {
            try {
                const response = await axiosInstance.get('/api/verification-tasks/homepage')
                set({ homepageTasks: response.data })
            } catch (error) {
                console.error('Error fetching verification tasks:', error)
            }
        },

        // Fetches verification tasks for a specific academy
        fetchAcademyVerificationTasks: async (academyId) => {
            try {
                const response = await axiosInstance.get(`/api/verification-tasks/academy/${academyId}`)
                set({ academyTasks: response.data || [] })
            } catch (error) {
                console.error('Error fetching academy verification tasks:', error)
            }
        }
    }))
)

export default useTasksStore
