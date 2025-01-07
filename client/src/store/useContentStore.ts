// src/store/useContentStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from '../api/axiosInstance'
import useAuthStore from './useAuthStore'
import useUserStore from './useUserStore'

type ContentType = 'Podcast' | 'Educator' | 'Tutorial' | 'YoutubeChannel' | 'TelegramGroup' | null

interface PodcastData {
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

interface EducatorData {
    name: string
    bio: string
    youtubeUrl: string
    twitterUrl: string
    telegramUrl: string
    discordUrl: string
    webpageUrl: string
    substackUrl: string
    logo: File | null | string
    coverPhoto: File | null | string
    categories: string[]
    chains: string[]
}

interface TutorialData {
    title: string
    description: string
    contentUrl: string
    type: string
    categories: string[]
    chains: string[]
    logo: File | null | string
    coverPhoto: File | null | string
}

interface YoutubeChannelData {
    name: string
    description: string
    youtubeUrl: string
    logo: File | null | string
    coverPhoto: File | null | string
    categories: string[]
    chains: string[]
}

interface TelegramGroupData {
    name: string
    description: string
    telegramUrl: string
    logo: File | null | string
    coverPhoto: File | null | string
    categories: string[]
    chains: string[]
}

interface ContentState {
    contentType: ContentType

    // Data for each content type
    podcastData: PodcastData
    educatorData: EducatorData
    tutorialData: TutorialData
    youtubeChannelData: YoutubeChannelData
    telegramGroupData: TelegramGroupData

    // Actions
    setContentType: (type: ContentType) => void
    setField: (field: string, value: any, ct?: ContentType) => void
    submitContent: (id?: number | null) => Promise<void>
    resetContentData: () => void
}

const useContentStore = create<ContentState>()(
    devtools((set, get) => ({
        // Default content type
        contentType: 'Podcast',

        // Default initial data states
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
            webpageUrl: '',
            substackUrl: '',
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

        youtubeChannelData: {
            name: '',
            description: '',
            youtubeUrl: '',
            logo: null,
            coverPhoto: null,
            categories: [],
            chains: []
        },

        telegramGroupData: {
            name: '',
            description: '',
            telegramUrl: '',
            logo: null,
            coverPhoto: null,
            categories: [],
            chains: []
        },

        // Set which content type we are working with
        setContentType: (type) => set({ contentType: type }),

        // Set a single field in whichever data object is currently active
        setField: (field, value, ct) => {
            const state = get()
            const currentType = ct || state.contentType
            if (!currentType) return

            // e.g. if contentType = 'Podcast', we update state.podcastData[field] = value
            const key = `${currentType.charAt(0).toLowerCase()}${currentType.slice(1)}Data` // e.g. "podcastData"
            // But for something like "YoutubeChannel", let's handle that with a small helper:
            const lower = currentType.toLowerCase() // "podcast", "youtubechannel", etc.
            const finalKey = lower.endsWith('channel') ? 'youtubeChannelData' : lower.endsWith('group') ? 'telegramGroupData' : `${lower}Data`

            set((s) => ({
                [finalKey]: {
                    ...s[finalKey],
                    [field]: value
                }
            }))
        },

        // Submit form data to the server
        submitContent: async (id?: number | null) => {
            const state = get()
            const { accessToken } = useAuthStore.getState()

            if (!accessToken) {
                throw new Error('Authorization token is missing')
            }

            try {
                let contentType = state.contentType
                if (!contentType) return

                // We'll unify contentType to a string for the endpoints.
                // e.g. 'Podcast' -> 'podcast'
                let endpointType = contentType.toLowerCase()

                // Map: 'youtubechannel' -> 'youtube-channels'
                //      'telegramgroup'  -> 'telegram-groups'
                // Everything else add an 's' (e.g. 'podcasts', 'educators', 'tutorials')
                let endpoint = ''
                if (endpointType === 'youtubechannel') {
                    endpoint = '/api/content/youtube-channels'
                } else if (endpointType === 'telegramgroup') {
                    endpoint = '/api/content/telegram-groups'
                } else {
                    endpoint = `/api/content/${endpointType}s`
                }

                // Grab the correct data set from the store:
                let data: any
                switch (contentType) {
                    case 'Podcast':
                        data = state.podcastData
                        break
                    case 'Educator':
                        data = state.educatorData
                        break
                    case 'Tutorial':
                        data = state.tutorialData
                        break
                    case 'YoutubeChannel':
                        data = state.youtubeChannelData
                        break
                    case 'TelegramGroup':
                        data = state.telegramGroupData
                        break
                    default:
                        data = {}
                        break
                }

                // Determine contentOrigin based on user roles
                const { roles } = useUserStore.getState()
                const isPlatformBased = roles.includes('SUPERADMIN') || roles.includes('ADMIN')
                const contentOrigin = isPlatformBased ? 'PLATFORM_BASED' : 'CREATOR_BASED'

                const formData = new FormData()

                // Append each field to formData
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        if (Array.isArray(value)) {
                            formData.append(key, JSON.stringify(value))
                        } else {
                            formData.append(key, value)
                        }
                    }
                })

                // Append contentOrigin
                formData.append('contentOrigin', contentOrigin)

                // Decide POST vs PUT
                let method: 'post' | 'put' = 'post'
                let finalEndpoint = endpoint

                if (id && id > 0) {
                    method = 'put'
                    finalEndpoint = `${endpoint}/${id}`
                }

                const response = await axios({
                    url: finalEndpoint,
                    method,
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${accessToken}`
                    }
                })

                console.log(`${contentType} ${id ? 'updated' : 'created'} successfully`, response.data)
                state.resetContentData()
            } catch (error) {
                console.error(`Error ${id ? 'updating' : 'creating'} ${state.contentType?.toLowerCase() ?? ''}:`, error)
                throw error
            }
        },

        // Reset form data for all content types
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
                },
                youtubeChannelData: {
                    name: '',
                    description: '',
                    youtubeUrl: '',
                    logo: null,
                    coverPhoto: null,
                    categories: [],
                    chains: []
                },
                telegramGroupData: {
                    name: '',
                    description: '',
                    telegramUrl: '',
                    logo: null,
                    coverPhoto: null,
                    categories: [],
                    chains: []
                }
            })
    }))
)

export default useContentStore
