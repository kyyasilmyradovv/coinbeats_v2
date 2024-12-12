import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from '../api/axiosInstance'
import useAuthStore from './useAuthStore'
import useUserStore from './useUserStore'

type ContentType = 'Podcast' | 'Educator' | 'Tutorial' | null

interface ContentState {
    contentType: ContentType
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
    setContentType: (type: ContentType) => void
    setField: (field: string, value: any, contentType?: ContentType) => void
    submitContent: (id?: number | null) => Promise<void>
    resetContentData: () => void
}

const useContentStore = create<ContentState>()(
    devtools((set, get) => ({
        contentType: 'Podcast',
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
        setField: (field, value, ct) => {
            const state = get()
            const currentType = ct || state.contentType
            if (!currentType) return
            set((state) => ({
                [`${currentType.toLowerCase()}Data`]: {
                    ...state[`${currentType.toLowerCase()}Data`],
                    [field]: value
                }
            }))
        },
        submitContent: async (id?: number | null) => {
            const state = get()
            const { accessToken } = useAuthStore.getState()

            if (!accessToken) {
                throw new Error('Authorization token is missing')
            }

            try {
                const contentType = state.contentType?.toLowerCase()
                if (!contentType) return

                const data = state[`${contentType}Data`]

                // Determine contentOrigin based on user roles
                const { roles } = useUserStore.getState()
                const isPlatformBased = roles.includes('SUPERADMIN') || roles.includes('ADMIN')
                const contentOrigin = isPlatformBased ? 'PLATFORM_BASED' : 'CREATOR_BASED'

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

                // Append contentOrigin
                formData.append('contentOrigin', contentOrigin)

                let endpoint = `/api/content/${contentType}s`
                let method: 'post' | 'put' = 'post'

                if (id && id > 0) {
                    // If we have an id, we assume we are updating
                    endpoint = `/api/content/${contentType}s/${id}`
                    method = 'put'
                }

                const response = await axios({
                    url: endpoint,
                    method,
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${accessToken}`
                    }
                })

                console.log(`${state.contentType} ${id ? 'updated' : 'created'} successfully`, response.data)
                state.resetContentData()
            } catch (error) {
                console.error(`Error ${id ? 'updating' : 'creating'} ${state.contentType?.toLowerCase()}:`, error)
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
