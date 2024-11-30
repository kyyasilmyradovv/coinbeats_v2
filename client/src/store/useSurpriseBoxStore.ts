import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

interface SurpriseBoxState {
    completedAcademies: number
    lastBox: number
    nextBox: number
    setField: (field: keyof SurpriseBoxState, value: number) => void
    increaseCompletedAcademies: (userId: number) => void
    loadSurpriseBoxData: (userId: number) => Promise<void>
    setNextBox: (userId: number, surprisePoint: number) => Promise<void>
}

// Function to generate a random increment for `nextBox`
const getRandomIncrement = (): number => {
    const increments = [3, 3, 5, 6]
    return increments[Math.floor(Math.random() * increments.length)]
}

const SurpriseBoxStore = create<SurpriseBoxState>()(
    devtools((set, get) => ({
        completedAcademies: 0,
        lastBox: 0,
        nextBox: 0,

        // Fetch the user's surprise box data from the database
        loadSurpriseBoxData: async (userId: number) => {
            try {
                const response = await axiosInstance.get(`/api/surprise-box?userId=${userId}`)
                if (!response) {
                    throw new Error('Failed to fetch surprise box data')
                }

                const { completedAcademies, lastBox, nextBox } = response?.data

                set({ completedAcademies, lastBox, nextBox })
            } catch (error) {
                console.error('Error loading surprise box data:', error)
            }
        },

        setField: (field, value) => {
            set((state) => ({
                ...state,
                [field]: value
            }))
        },

        increaseCompletedAcademies: async (userId: number) => {
            const { completedAcademies } = get()

            // Increment `completedAcademies`
            const newCompletedAcademies = completedAcademies + 1
            set({ completedAcademies: newCompletedAcademies })

            try {
                await axiosInstance.put(
                    `/api/surprise-box?userId=${userId}`,
                    { completedAcademies: newCompletedAcademies },
                    { headers: { 'Content-Type': 'application/json' } }
                )
            } catch (error) {
                console.error('Error updating surprise box data:', error)
            }
        },

        setNextBox: async (userId: number, surprisePoint) => {
            const { completedAcademies } = get()

            const a = getRandomIncrement()

            // Check if the nextBox should be updated
            set({
                lastBox: completedAcademies,
                nextBox: completedAcademies + a
            })

            try {
                await axiosInstance.put(
                    `/api/surprise-box?userId=${userId}`,
                    { lastBox: get().lastBox, nextBox: get().nextBox, surprisePoint },
                    { headers: { 'Content-Type': 'application/json' } }
                )
            } catch (error) {
                console.error('Error updating surprise box data:', error)
            }
        }
    }))
)

export default SurpriseBoxStore
