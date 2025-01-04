// src/store/useDiscoverStore.ts

import { create } from 'zustand'
import axios from '../api/axiosInstance'

interface Lesson {
    id: number
    title: string
    contentUrl: string
    type: 'YOUTUBE_VIDEO' | 'TWITTER_THREAD' | 'ARTICLE'
    xp: number
}

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
    categories?: Category[]
    chains?: Chain[]
}

interface Podcast {
    id: number
    name: string
    description?: string
    spotifyUrl?: string
    appleUrl?: string
    youtubeUrl?: string
    logoUrl?: string
    coverPhotoUrl?: string
    categories?: Category[]
    chains?: Chain[]
}

interface Tutorial {
    id: number
    title: string
    contentUrl: string
    type: 'WALLET_SETUP' | 'CEX_TUTORIAL' | 'APP_TUTORIAL' | 'RESEARCH_TUTORIAL' | 'OTHER'
    xp: number
    categories?: Category[]
    chains?: Chain[]
    logoUrl?: string
    coverPhotoUrl?: string
    description?: string
}

interface YoutubeChannel {
    id: number
    name: string
    description?: string
    youtubeUrl?: string
    logoUrl?: string
    coverPhotoUrl?: string
    categories?: Category[]
    chains?: Chain[]
}

interface TelegramGroup {
    id: number
    name: string
    description?: string
    telegramUrl?: string
    logoUrl?: string
    coverPhotoUrl?: string
    categories?: Category[]
    chains?: Chain[]
}

interface Category {
    id: number
    name: string
}

interface Chain {
    id: number
    name: string
}

interface DiscoverState {
    educators: Educator[]
    podcasts: Podcast[]
    tutorials: Tutorial[]
    youtubeChannels: YoutubeChannel[]
    telegramGroups: TelegramGroup[]
    categories: Category[]
    fetchEducators: () => Promise<void>
    fetchPodcasts: () => Promise<void>
    fetchTutorials: () => Promise<void>
    fetchYoutubeChannels: () => Promise<void>
    fetchTelegramGroups: () => Promise<void>
    fetchCategories: () => Promise<void>
}

const useDiscoverStore = create<DiscoverState>((set) => ({
    educators: [],
    podcasts: [],
    tutorials: [],
    youtubeChannels: [],
    telegramGroups: [],
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

    fetchYoutubeChannels: async () => {
        try {
            const response = await axios.get('/api/discover/youtube-channels')
            set({ youtubeChannels: response.data })
        } catch (error) {
            console.error('Error fetching youtube channels:', error)
        }
    },

    fetchTelegramGroups: async () => {
        try {
            const response = await axios.get('/api/discover/telegram-groups')
            set({ telegramGroups: response.data })
        } catch (error) {
            console.error('Error fetching telegram groups:', error)
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
