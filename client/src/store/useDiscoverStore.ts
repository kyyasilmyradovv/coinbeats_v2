// src/store/useDiscoverStore.ts

import { create } from 'zustand'
import axios from '../api/axiosInstance'

interface Educator {
    id: number
    name: string
    bio?: string
    avatarUrl?: string
    youtubeUrl?: string
    twitterUrl?: string
    telegramUrl?: string
    discordUrl?: string
    lessons: Lesson[]
}

interface Lesson {
    id: number
    title: string
    contentUrl: string
    type: 'YOUTUBE_VIDEO' | 'TWITTER_THREAD' | 'ARTICLE'
    xp: number
}

interface Podcast {
    id: number
    name: string
    description?: string
    spotifyUrl?: string
    appleUrl?: string
    youtubeUrl?: string
}

interface Tutorial {
    id: number
    title: string
    contentUrl: string
    type: 'WALLET_SETUP' | 'CEX_TUTORIAL' | 'APP_TUTORIAL' | 'RESEARCH_TUTORIAL' | 'OTHER'
    xp: number
    categories: Category[]
}

interface Category {
    id: number
    name: string
}

interface DiscoverState {
    educators: Educator[]
    podcasts: Podcast[]
    tutorials: Tutorial[]
    categories: Category[]
    fetchEducators: () => Promise<void>
    fetchPodcasts: () => Promise<void>
    fetchTutorials: () => Promise<void>
    fetchCategories: () => Promise<void>
}

const useDiscoverStore = create<DiscoverState>((set) => ({
    educators: [],
    podcasts: [],
    tutorials: [],
    categories: [],
    fetchEducators: async () => {
        try {
            const response = await axios.get('/api/discover/educators')
            set({ educators: response.data })
        } catch (error) {
            console.error('Error fetching educators:', error)
        }
    },
    fetchPodcasts: async () => {
        try {
            const response = await axios.get('/api/discover/podcasts')
            set({ podcasts: response.data })
        } catch (error) {
            console.error('Error fetching podcasts:', error)
        }
    },
    fetchTutorials: async () => {
        try {
            const response = await axios.get('/api/discover/tutorials')
            set({ tutorials: response.data })
        } catch (error) {
            console.error('Error fetching tutorials:', error)
        }
    },
    fetchCategories: async () => {
        try {
            const response = await axios.get('/api/categories')
            set({ categories: response.data })
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }
}))

export default useDiscoverStore
