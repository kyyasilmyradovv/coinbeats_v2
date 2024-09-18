// client/src/store/useAcademyStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from '../api/axiosInstance'
import useAuthStore from './useAuthStore'

interface Choice {
    id?: number // Include ID as optional
    answer: string
    correct: boolean
}

interface InitialAnswer {
    id?: number // Include ID as optional
    initialQuestionId: number
    question: string
    answer: string
    quizQuestion: string
    choices: Choice[]
    video: string
    chains?: string[] // Added for question 4
    utility?: string // Added for question 4
    totalSupply?: string // Added for question 4
    logic?: string // Added for question 4
    coingecko?: string // Added for question 4
    dexScreener?: string // Added for question 4
    contractAddress?: string // Added for question 4
}

interface Raffle {
    amount: string
    reward: string
    currency: string
    chain: string
    dates: string
    totalPool: string
}

interface Quest {
    name: string
    link: string
    platform: string
}

interface AcademyState {
    name: string
    ticker: string
    categories: string[]
    chains: string[]
    twitter: string
    telegram: string
    discord: string
    coingecko: string
    logo: File | null
    coverPhoto: File | null
    webpageUrl: string
    initialAnswers: InitialAnswer[]
    tokenomics: string
    teamBackground: string
    congratsVideo: string
    getStarted: string
    raffles: Raffle[]
    quests: Quest[]
    visibleQuestionsCount: number
    currentStep: number
    videoUrls: { initialQuestionId: number; url: string }[]
    setVideoUrl: (index: number, url: string) => void
    submitVideoLessons: (academyId: number) => Promise<void>
    setField: (
        field: keyof Omit<
            AcademyState,
            | 'setField'
            | 'setInitialAnswer'
            | 'toggleCorrectAnswer'
            | 'addRaffle'
            | 'addQuest'
            | 'submitAcademy'
            | 'resetAcademyData'
            | 'fetchQuestions'
            | 'nextStep'
            | 'prevStep'
            | 'removeRaffle'
            | 'removeQuest'
            | 'setVideoUrl'
            | 'submitVideoLessons'
            | 'setPrefilledAcademyData'
        >,
        value: any
    ) => void
    setInitialAnswer: (index: number, field: keyof InitialAnswer, value: any) => void
    toggleCorrectAnswer: (questionIndex: number, choiceIndex: number) => void
    addRaffle: () => void
    removeRaffle: (index: number) => void
    addQuest: () => void
    removeQuest: (index: number) => void
    submitAcademy: (academyId?: number, logoFile?: File | null, coverPhotoFile?: File | null) => Promise<void>
    updateAcademy: (academyId: number, logoFile?: File | null, coverPhotoFile?: File | null) => Promise<void>
    submitBasicAcademy: () => Promise<void>
    resetAcademyData: () => void
    fetchQuestions: () => Promise<void>
    fetchVideoUrls: (academyId: number) => Promise<void>
    fetchQuests: (academyId: number) => Promise<void>
    nextStep: () => void
    prevStep: () => void
    initialAcademyData: Partial<AcademyState>
    setPrefilledAcademyData: (data: any) => void
}

const useAcademyStore = create<AcademyState>()(
    devtools(
        (set, get) => ({
            name: '',
            ticker: '',
            categories: [],
            chains: [],
            twitter: '',
            telegram: '',
            discord: '',
            coingecko: '',
            logo: null,
            coverPhoto: null,
            webpageUrl: '',
            initialAnswers: [],
            tokenomics: '',
            teamBackground: '',
            congratsVideo: '',
            getStarted: '',
            raffles: [],
            quests: [],
            visibleQuestionsCount: 1,
            currentStep: 0,
            videoUrls: [],
            initialAcademyData: {}, // Initialize as an empty object

            setField: (field, value) =>
                set(
                    (state) => {
                        const updatedValue = value !== undefined ? value : state[field]
                        return { ...state, [field]: updatedValue }
                    },
                    false,
                    `setField: ${field}`
                ),

            setInitialAnswer: (index, field, value) =>
                set((state) => {
                    const updatedAnswers = [...state.initialAnswers]

                    if (field === 'choices') {
                        const newChoices = [...updatedAnswers[index].choices]
                        newChoices[value.index] = {
                            ...newChoices[value.index],
                            answer: value.choice.answer !== undefined ? value.choice.answer : '',
                            correct: value.choice.correct ?? newChoices[value.index].correct
                        }
                        updatedAnswers[index].choices = newChoices
                    } else {
                        updatedAnswers[index][field] = value !== undefined ? value : updatedAnswers[index][field]
                    }
                    return { initialAnswers: updatedAnswers }
                }),

            toggleCorrectAnswer: (questionIndex, choiceIndex) =>
                set((state) => {
                    const updatedAnswers = [...state.initialAnswers]
                    updatedAnswers[questionIndex].choices.forEach((choice, index) => {
                        choice.correct = index === choiceIndex
                    })
                    return { initialAnswers: updatedAnswers }
                }),

            addRaffle: () =>
                set((state) => ({
                    raffles: [...state.raffles, { amount: '', reward: '', currency: '', chain: '', dates: '', totalPool: '' }]
                })),

            removeRaffle: (index: number) =>
                set((state) => ({
                    raffles: state.raffles.filter((_, i) => i !== index)
                })),

            addQuest: () =>
                set((state) => ({
                    quests: [...state.quests, { name: '', link: '', platform: '' }]
                })),

            removeQuest: (index: number) =>
                set((state) => ({
                    quests: state.quests.filter((_, i) => i !== index)
                })),

            fetchQuests: async (academyId: number) => {
                try {
                    const response = await axios.get(`/api/academies/${academyId}/quests`)
                    set({ quests: response.data })
                } catch (error) {
                    console.error('Error fetching quests:', error)
                }
            },

            submitAcademy: async (academyId?: number, logoFile?: File | null, coverPhotoFile?: File | null) => {
                const state = get()
                const { accessToken } = useAuthStore.getState()

                if (!accessToken) {
                    console.error('Authorization token is missing')
                    throw new Error('Authorization token is missing')
                }

                try {
                    const formData = new FormData()
                    formData.append('name', state.name)
                    formData.append('ticker', state.ticker)
                    formData.append('webpageUrl', state.webpageUrl)

                    // Append the logo and cover photo files
                    if (logoFile || state.logo) formData.append('logo', logoFile || state.logo)
                    if (coverPhotoFile || state.coverPhoto) formData.append('coverPhoto', coverPhotoFile || state.coverPhoto)

                    formData.append('categories', JSON.stringify(state.categories))
                    formData.append('chains', JSON.stringify(state.chains))
                    formData.append('twitter', state.twitter)
                    formData.append('telegram', state.telegram)
                    formData.append('discord', state.discord)
                    formData.append('coingecko', state.coingecko)

                    // Process the tokenomics data
                    const tokenomicsData = {
                        chains: state.initialAnswers[3]?.chains || [],
                        utility: state.initialAnswers[3]?.utility || '',
                        totalSupply: state.initialAnswers[3]?.totalSupply || '',
                        logic: state.initialAnswers[3]?.logic || '',
                        coingecko: state.initialAnswers[3]?.coingecko || '',
                        dexScreener: state.initialAnswers[3]?.dexScreener || '',
                        contractAddress: state.initialAnswers[3]?.contractAddress || ''
                    }

                    // Update initialAnswers[3] with the tokenomics data
                    const updatedInitialAnswers = state.initialAnswers.map((answer, index) => {
                        if (index === 3) {
                            return {
                                ...answer,
                                answer: JSON.stringify(tokenomicsData)
                            }
                        }
                        return answer
                    })

                    formData.append('initialAnswers', JSON.stringify(updatedInitialAnswers))
                    formData.append('tokenomics', state.tokenomics)
                    formData.append('teamBackground', state.teamBackground)
                    formData.append('congratsVideo', state.congratsVideo)
                    formData.append('getStarted', state.getStarted)
                    formData.append('raffles', JSON.stringify(state.raffles || []))
                    formData.append('quests', JSON.stringify(state.quests || []))

                    // Include duplicated fields
                    formData.append('coingeckoLink', tokenomicsData.coingecko)
                    formData.append('dexScreenerLink', tokenomicsData.dexScreener)
                    formData.append('contractAddress', tokenomicsData.contractAddress)

                    const url = academyId ? `/api/academies/${academyId}` : `/api/academies`
                    const method = academyId ? 'put' : 'post'

                    await axios[method](url, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${accessToken}`
                        }
                    })

                    state.resetAcademyData()
                } catch (error) {
                    console.error('Error creating or updating academy:', error)
                    throw error
                }
            },

            updateAcademy: async (academyId, logoFile, coverPhotoFile) => {
                const state = get()
                const { accessToken } = useAuthStore.getState()

                if (!accessToken) {
                    console.error('Authorization token is missing')
                    throw new Error('Authorization token is missing')
                }

                try {
                    const formData = new FormData()
                    const initialState = state.initialAcademyData || {} // Initial data to compare changes

                    // Helper function to append data if it has changed or is intentionally set to empty
                    const appendIfChangedOrCleared = (key, value) => {
                        if (value !== undefined && initialState[key] !== value) {
                            formData.append(key, value)
                        }
                    }

                    // Append fields that have changed or are intentionally cleared
                    appendIfChangedOrCleared('name', state.name)
                    appendIfChangedOrCleared('ticker', state.ticker)
                    appendIfChangedOrCleared('webpageUrl', state.webpageUrl)
                    appendIfChangedOrCleared('twitter', state.twitter)
                    appendIfChangedOrCleared('telegram', state.telegram)
                    appendIfChangedOrCleared('discord', state.discord)
                    appendIfChangedOrCleared('coingecko', state.coingecko)

                    // Handle logo and cover photo updates
                    if (logoFile || state.logo !== initialState.logo) {
                        formData.append('logo', logoFile || state.logo)
                    }
                    if (coverPhotoFile || state.coverPhoto !== initialState.coverPhoto) {
                        formData.append('coverPhoto', coverPhotoFile || state.coverPhoto)
                    }

                    // Compare and handle tokenomics data updates
                    const tokenomicsData = {
                        chains: state.initialAnswers[3]?.chains || [],
                        utility: state.initialAnswers[3]?.utility || '',
                        totalSupply: state.initialAnswers[3]?.totalSupply || '',
                        logic: state.initialAnswers[3]?.logic || '',
                        coingecko: state.initialAnswers[3]?.coingecko || '',
                        dexScreener: state.initialAnswers[3]?.dexScreener || '',
                        contractAddress: state.initialAnswers[3]?.contractAddress || ''
                    }

                    if (JSON.stringify(initialState.tokenomics) !== JSON.stringify(tokenomicsData)) {
                        formData.append('tokenomics', JSON.stringify(tokenomicsData))
                    }

                    // Handle initialAnswers (including video URLs)
                    if (JSON.stringify(initialState.initialAnswers) !== JSON.stringify(state.initialAnswers)) {
                        const updatedInitialAnswers = state.initialAnswers.map((answer) => ({
                            ...answer,
                            id: answer.id ? Number(answer.id) : undefined,
                            choices: answer.choices.map((choice) => ({
                                ...choice,
                                id: choice.id ? Number(choice.id) : undefined
                            }))
                        }))

                        formData.append('initialAnswers', JSON.stringify(updatedInitialAnswers))
                    }

                    // Handle raffles and quests
                    if (JSON.stringify(initialState.raffles) !== JSON.stringify(state.raffles)) {
                        formData.append('raffles', JSON.stringify(state.raffles))
                    }
                    if (JSON.stringify(initialState.quests) !== JSON.stringify(state.quests)) {
                        formData.append('quests', JSON.stringify(state.quests))
                    }

                    // Perform the PUT request to update the academy
                    await axios.put(`/api/academies/${academyId}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${accessToken}`
                        }
                    })

                    // Update the initial state to reflect the latest changes
                    set({ initialAcademyData: JSON.parse(JSON.stringify(state)) })
                } catch (error) {
                    console.error('Error updating academy:', error)
                    throw error
                }
            },

            submitBasicAcademy: async () => {
                const state = get()
                const { accessToken } = useAuthStore.getState()

                if (!accessToken) {
                    console.error('Authorization token is missing')
                    throw new Error('Authorization token is missing')
                }

                try {
                    const formData = new FormData()
                    formData.append('name', state.name)
                    formData.append('ticker', state.ticker)
                    formData.append('webpageUrl', state.webpageUrl)
                    if (state.logo) formData.append('logo', state.logo)
                    if (state.coverPhoto) formData.append('coverPhoto', state.coverPhoto)
                    formData.append('categories', JSON.stringify(state.categories))
                    formData.append('chains', JSON.stringify(state.chains))
                    formData.append('twitter', state.twitter)
                    formData.append('telegram', state.telegram)
                    formData.append('discord', state.discord)
                    formData.append('coingecko', state.coingecko)
                    formData.append('tokenomics', state.tokenomics)
                    formData.append('teamBackground', state.teamBackground)
                    formData.append('congratsVideo', state.congratsVideo)
                    formData.append('getStarted', state.getStarted)

                    // Add these fields as empty arrays or default values to make them visible on the edit page
                    formData.append('initialAnswers', JSON.stringify(state.initialAnswers || []))
                    formData.append('raffles', JSON.stringify(state.raffles || []))
                    formData.append('quests', JSON.stringify(state.quests || []))

                    await axios.post('/api/academies/basic', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${accessToken}`
                        }
                    })

                    state.resetAcademyData()
                } catch (error) {
                    console.error('Error creating basic academy:', error)
                    throw error
                }
            },

            resetAcademyData: () => {
                set(
                    {
                        name: '',
                        ticker: '',
                        categories: [],
                        chains: [],
                        twitter: '',
                        telegram: '',
                        discord: '',
                        coingecko: '',
                        logo: null,
                        coverPhoto: null,
                        webpageUrl: '',
                        initialAnswers: [],
                        tokenomics: '',
                        teamBackground: '',
                        congratsVideo: '',
                        getStarted: '',
                        raffles: [],
                        quests: [],
                        videoUrls: [],
                        visibleQuestionsCount: 1,
                        currentStep: 0,
                        initialAcademyData: {}
                    },
                    false,
                    'Reset Academy Data'
                )

                // Debugging: Log out the state after reset
                const currentState = get()
                console.log('State after reset:', currentState)
            },

            fetchQuestions: async () => {
                try {
                    const response = await axios.get('/api/questions/initial-questions')
                    const questions = response.data

                    set(() => ({
                        initialAnswers: questions.map((question) => ({
                            initialQuestionId: question.id,
                            question: question.question,
                            answer: '',
                            quizQuestion: '',
                            choices: Array(4).fill({ answer: '', correct: false }),
                            video: ''
                        }))
                    }))
                } catch (error) {
                    console.error('Error fetching initial questions:', error)
                }
            },

            setVideoUrl: (index, url) =>
                set((state) => {
                    const updatedVideoUrls = [...state.videoUrls]
                    updatedVideoUrls[index] = { initialQuestionId: state.initialAnswers[index].initialQuestionId, url }
                    return { videoUrls: updatedVideoUrls }
                }),

            fetchVideoUrls: async (academyId: number) => {
                console.log('Fetching video URLs for Academy ID:', academyId) // Log the Academy ID being used

                try {
                    const response = await axios.get(`/api/academies/${academyId}/videos`)
                    console.log('Video URLs response from backend:', response.data) // Log the response data

                    // Map the video URLs to ensure there are no null values
                    const videoUrls = response.data.videoUrls.map((item) => ({
                        initialQuestionId: item.initialQuestionId,
                        url: item.video || '' // Replace null with an empty string
                    }))

                    set({ videoUrls })
                } catch (error) {
                    console.error('Error fetching video URLs:', error) // Log any errors that occur

                    // Additional logging for debugging
                    if (error.response) {
                        console.error('Backend response:', error.response.data)
                    }
                }
            },

            submitVideoLessons: async (academyId: number) => {
                const state = get()
                const { accessToken } = useAuthStore.getState()

                if (!accessToken) {
                    throw new Error('Authorization token is missing')
                }

                try {
                    // Extract video URLs from the current initialAnswers state
                    const videoUrls = state.initialAnswers.map((answer) => ({
                        initialQuestionId: answer.initialQuestionId,
                        url: answer.video || '' // Use the video field from initialAnswers
                    }))

                    await axios.put(
                        `/api/academies/${academyId}/videos`,
                        { videoUrls }, // Send the extracted video URLs
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${accessToken}`
                            }
                        }
                    )
                } catch (error) {
                    console.error('Error submitting video lessons:', error)
                    throw error
                }
            },

            nextStep: () => {
                const state = get()
                const totalSlides = 1 + state.initialAnswers.length + 4 + state.initialAnswers.length + 1
                if (state.currentStep < totalSlides - 1) {
                    set({ currentStep: state.currentStep + 1 })
                }
            },

            prevStep: () => {
                const state = get()
                if (state.currentStep > 0) {
                    set({ currentStep: state.currentStep - 1 })
                }
            },

            setPrefilledAcademyData: async (data) => {
                // Fetch initial questions if academyQuestions are empty
                let initialQuestions = []

                if (data.academyQuestions.length === 0) {
                    try {
                        const response = await axios.get('/api/questions/initial-questions') // Fetch initial questions from backend
                        initialQuestions = response.data
                    } catch (error) {
                        console.error('Error fetching initial questions:', error)
                    }
                }

                const initialAnswers = data.academyQuestions.map((question) => ({
                    id: question.id, // Include the academyQuestion ID
                    initialQuestionId: question.initialQuestionId,
                    question: question.initialQuestion?.question || '',
                    answer: question.answer || '',
                    quizQuestion: question.quizQuestion || '',
                    choices: question.choices.map((choice) => ({
                        id: choice.id, // Include the choice ID
                        answer: choice.text || '',
                        correct: choice.isCorrect || false
                    })),
                    video: question.video || ''
                }))

                // Sort initialAnswers by initialQuestionId
                const sortedInitialAnswers = initialAnswers.sort((a, b) => a.initialQuestionId - b.initialQuestionId)

                // Include IDs in quests
                const quests = data.quests.map((quest) => ({
                    id: quest.id,
                    name: quest.name || '',
                    link: quest.link || '',
                    platform: quest.platform || ''
                }))

                const initialData = {
                    name: data.name || '',
                    ticker: data.ticker || '',
                    categories: data.categories.map((cat) => cat.name) || [],
                    chains: data.chains.map((chain) => chain.name) || [],
                    twitter: data.twitter || '',
                    telegram: data.telegram || '',
                    discord: data.discord || '',
                    coingecko: data.coingecko || '',
                    logo: data.logoUrl || null,
                    coverPhoto: data.coverPhotoUrl || null,
                    webpageUrl: data.webpageUrl || '',
                    initialAnswers,
                    tokenomics: data.tokenomics || '',
                    teamBackground: data.teamBackground || '',
                    congratsVideo: data.congratsVideo || '',
                    getStarted: data.getStarted || '',
                    raffles: data.raffles || [],
                    quests: data.quests || []
                }

                // Set the current state with the data
                set(initialData)

                // Save a deep copy of the initial data
                set({ initialAcademyData: JSON.parse(JSON.stringify(initialData)) })

                console.log('Academy data set in store:', get())
            }
        }),
        { name: 'AcademyStore' }
    )
)

export default useAcademyStore
