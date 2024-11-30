// src/store/useContentStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from '../api/axiosInstance'
import useAuthStore from './useAuthStore'

interface ContentState {
    contentType: 'Podcast' | 'Educator' | 'Tutorial' | null
    podcastData: {
        name: string
        description: string
        spotifyUrl: string
        appleUrl: string
        youtubeUrl: string
        logo: File | null | string
        coverPhoto: File | null | string
        categories: string[]
        chains: string[]
    }
    educatorData: {
        name: string
        bio: string
        youtubeUrl: string
        twitterUrl: string
        telegramUrl: string
        discordUrl: string
        logo: File | null | string
        coverPhoto: File | null | string
        categories: string[]
        chains: string[]
    }
    tutorialData: {
        title: string
        description: string
        contentUrl: string
        type: string
        categories: string[]
        chains: string[]
        logo: File | null | string
        coverPhoto: File | null | string
    }
    setContentType: (type: ContentState['contentType']) => void
    setField: (field: string, value: any, contentType?: ContentState['contentType']) => void
    submitContent: () => Promise<void>
    resetContentData: () => void
}

const useContentStore = create<ContentState>()(
    devtools((set, get) => ({
        contentType: null,
        podcastData: {
            name: '',
            description: '',
            spotifyUrl: '',
            appleUrl: '',
            youtubeUrl: '',
            logo: null,
            coverPhoto: null,
            categories: [],
            chains: []
        },
        educatorData: {
            name: '',
            bio: '',
            youtubeUrl: '',
            twitterUrl: '',
            telegramUrl: '',
            discordUrl: '',
            logo: null,
            coverPhoto: null,
            categories: [],
            chains: []
        },
        tutorialData: {
            title: '',
            description: '',
            contentUrl: '',
            type: '',
            categories: [],
            chains: [],
            logo: null,
            coverPhoto: null
        },
        setContentType: (type) => set({ contentType: type }),
        setField: (field, value, contentType) => {
            const state = get()
            const currentType = contentType || state.contentType
            if (!currentType) return
            set((state) => ({
                [`${currentType.toLowerCase()}Data`]: {
                    ...state[`${currentType.toLowerCase()}Data`],
                    [field]: value
                }
            }))
        },
        submitContent: async () => {
            const state = get()
            const { accessToken } = useAuthStore.getState()

            if (!accessToken) {
                throw new Error('Authorization token is missing')
            }

            try {
                const contentType = state.contentType?.toLowerCase()
                if (!contentType) return
                const data = state[`${contentType}Data`]

                const formData = new FormData()

                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        if (Array.isArray(value)) {
                            // For arrays, stringify them
                            formData.append(key, JSON.stringify(value))
                        } else {
                            formData.append(key, value)
                        }
                    }
                })

                const response = await axios.post(`/api/content/${contentType}s`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${accessToken}`
                    }
                })

                console.log(`${state.contentType} created successfully`, response.data)
                state.resetContentData()
            } catch (error) {
                console.error(`Error creating ${state.contentType?.toLowerCase()}:`, error)
                throw error
            }
        },
        resetContentData: () =>
            set({
                podcastData: {
                    name: '',
                    description: '',
                    spotifyUrl: '',
                    appleUrl: '',
                    youtubeUrl: '',
                    logo: null,
                    coverPhoto: null,
                    categories: [],
                    chains: []
                },
                educatorData: {
                    name: '',
                    bio: '',
                    youtubeUrl: '',
                    twitterUrl: '',
                    telegramUrl: '',
                    discordUrl: '',
                    logo: null,
                    coverPhoto: null,
                    categories: [],
                    chains: []
                },
                tutorialData: {
                    title: '',
                    description: '',
                    contentUrl: '',
                    type: '',
                    categories: [],
                    chains: [],
                    logo: null,
                    coverPhoto: null
                }
            })
    }))
)

export default useContentStore
