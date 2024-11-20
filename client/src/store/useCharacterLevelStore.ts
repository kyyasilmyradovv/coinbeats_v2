import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

interface CharacterLevel {
    id: number
    levelName: string
    minPoints: number
    maxPoints: number
    rewardPoints: number
    lottieFileUrl: string | null
    createdAt: string
    updatedAt: string
}

interface CharacterLevelState {
    characterLevels: CharacterLevel[]
    fetchCharacterLevels: () => Promise<void>
}

const useCharacterLevelStore = create<CharacterLevelState>()(
    devtools((set) => ({
        characterLevels: [],
        fetchCharacterLevels: async () => {
            try {
                const response = await axiosInstance.get('/api/character-levels')
                set({ characterLevels: response.data })
            } catch (error) {
                console.error('Error fetching character levels:', error)
            }
        }
    }))
)

export default useCharacterLevelStore
