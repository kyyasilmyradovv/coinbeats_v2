// src/store/useAcademiesStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

interface AcademyType {
    id: number
    name: string
}

interface AcademyData {
    id: number
    name: string
    logoUrl: string
    coverPhotoUrl: string
    xp: number
    status: string
    ticker: string
    categories: any[]
    chains: any[]
    academyType: AcademyType
    createdAt: string
}

interface AcademiesState {
    academies: AcademyData[]
    setAcademies: (academies: AcademyData[]) => void
    fetchAcademiesAndPreloadImages: () => Promise<void>
    getAcademies: () => Promise<AcademyData[]>
    preloadAcademyImages: (academies: AcademyData[]) => void
}

const useAcademiesStore = create<AcademiesState>()(
    devtools((set, get) => ({
        academies: [],
        setAcademies: (academies) => set({ academies }),

        // Fetches the list of academies
        getAcademies: async () => {
            // Endpoint: GET /api/academies/academies
            const response = await axiosInstance.get('/api/academies/academies')
            return response.data
        },

        // Preloads academy images for better performance
        preloadAcademyImages: (academies) => {
            const head = document.head || document.getElementsByTagName('head')[0]
            academies.forEach((academy: AcademyData) => {
                const link = document.createElement('link')
                link.rel = 'preload'
                link.as = 'image'
                link.href = constructImageUrl(academy.logoUrl)
                head.appendChild(link)
            })
        },

        fetchAcademiesAndPreloadImages: async () => {
            try {
                const academiesData = await get().getAcademies()

                // Filter for approved academies
                const approvedAcademies = academiesData.filter((academy: AcademyData) => academy.status === 'approved')

                // Separate Coinbeats academies
                const coinbeatsAcademies = approvedAcademies.filter((academy) => academy.academyType.name === 'Coinbeats')
                const otherAcademies = approvedAcademies.filter((academy) => academy.academyType.name !== 'Coinbeats')

                // Shuffle the other academies
                const shuffledOtherAcademies = shuffleArray(otherAcademies)

                // Combine academies
                const combinedAcademies = [...coinbeatsAcademies, ...shuffledOtherAcademies]

                // Store academies data in the global store
                set({ academies: combinedAcademies })

                // Preload images
                get().preloadAcademyImages(combinedAcademies)
            } catch (error) {
                console.error('Error fetching academies:', error)
            }
        }
    }))
)

// Utility function to construct image URL
const constructImageUrl = (url: string) => {
    return `https://subscribes.lt/${url}`
}

// Utility function to shuffle an array
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

export default useAcademiesStore
