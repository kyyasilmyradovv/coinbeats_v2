// src/store/useAcademiesStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'
import useUserStore from './useUserStore' // Import useUserStore to update user points
import useSessionStore from './useSessionStore'
import useNotificationStore from './useNotificationStore'

interface AcademyType {
    id: number
    name: string
}

interface AcademyData {
    id: number
    name: string
    twitter: string
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

interface Choice {
    id: number
    text: string
    isCorrect?: boolean // Make isCorrect optional
}

interface Question {
    academyQuestionId: number
    initialQuestionId: number
    question: string
    answer: string
    quizQuestion: string
    video: string
    xp: number
    choices: Choice[]
    selectedChoice?: number
    isCorrect?: boolean
    timerStarted?: boolean
}

interface AcademiesState {
    academies: AcademyData[]
    setAcademies: (academies: AcademyData[]) => void
    fetchAcademiesAndPreloadImages: () => Promise<void>
    getAcademies: () => Promise<AcademyData[]>
    preloadAcademyImages: (academies: AcademyData[]) => void

    earnedPoints: number
    setEarnedPoints: (points: number) => void
    fetchEarnedPoints: (userId: number, academyId: number) => Promise<void>

    questions: Question[]
    setQuestions: (questions: Question[]) => void
    fetchQuestions: (academyId: number) => Promise<void>
    fetchUserResponses: (userId: number, academyId: number) => Promise<void>

    fetchQuests: (academyId: number) => Promise<void>
    quests: any[]
    setQuests: (quests: any[]) => void

    checkAnswer: (academyId: number, questionId: number, choiceId: number, telegramUserId: number) => Promise<{ correct: boolean; maxPoints: number }>

    saveResponse: (academyId: number, questionId: number, choiceId: number, telegramUserId: number, isCorrect: boolean, pointsAwarded: number) => Promise<void>

    submitQuiz: (academyId: number, userId: number) => Promise<void>
    fetchUserTotalPoints: (userId: number) => Promise<void>
    fetchUserTotalRaffles: (userId: number) => Promise<void>
    fetchAcademyById: (id: number) => Promise<AcademyData>
}

const useAcademiesStore = create<AcademiesState>()(
    devtools((set, get) => ({
        academies: [],
        earnedPoints: 0,
        questions: [],
        quests: [],
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

        fetchAcademyById: async (id) => {
            try {
                const response = await axiosInstance.get(`/api/academies/${id}`)
                return response.data
            } catch (error) {
                console.error('Error fetching academy by ID:', error)
                throw error
            }
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
        },

        setEarnedPoints: (points) => set({ earnedPoints: points }),

        fetchEarnedPoints: async (userId, academyId) => {
            try {
                const response = await axiosInstance.get(`/api/points/${userId}/${academyId}`)
                const points = response.data.value || 0
                set({ earnedPoints: points })
            } catch (error) {
                console.error('Error fetching earned points:', error)
                set({ earnedPoints: 0 })
            }
        },

        setQuestions: (questions) => set({ questions }),

        fetchQuestions: async (academyId) => {
            try {
                const response = await axiosInstance.get(`/api/academies/${academyId}/questions`)
                const questions = response.data || []
                const mappedQuestions = questions.map((question: any) => ({
                    academyQuestionId: question.id,
                    initialQuestionId: question.initialQuestionId,
                    question: question.question,
                    answer: question.answer,
                    quizQuestion: question.quizQuestion,
                    video: question.video,
                    xp: question.xp,
                    choices: question.choices.map((choice: any) => ({
                        id: choice.id,
                        text: choice.text
                        // isCorrect is omitted
                    })),
                    selectedChoice: undefined,
                    isCorrect: undefined,
                    timerStarted: false
                }))
                const sortedQuestions = mappedQuestions.sort((a, b) => a.initialQuestionId - b.initialQuestionId)
                set({ questions: sortedQuestions })
            } catch (error) {
                console.error('Error fetching questions:', error)
            }
        },

        fetchUserResponses: async (userId, academyId) => {
            try {
                const response = await axiosInstance.get(`/api/academies/${userId}/${academyId}`)
                const userResponses = response.data || []
                const questions = get().questions

                const answeredQuestionIds = userResponses.map((r: any) => r.choice.academyQuestionId)

                if (answeredQuestionIds.length > 0) {
                    // Fetch correct choices for answered questions
                    const telegramUserId = useSessionStore.getState().userId

                    const correctChoicesResponse = await axiosInstance.post(`/api/academies/${academyId}/correct-choices`, {
                        telegramUserId,
                        questionIds: answeredQuestionIds
                    })
                    const correctChoiceMap = correctChoicesResponse.data.correctChoices

                    // Now update the questions
                    const questionsWithUserResponses = questions.map((question) => {
                        const userResponse = userResponses.find((r: any) => r.choice.academyQuestionId === question.academyQuestionId)
                        if (userResponse) {
                            question.selectedChoice = question.choices.findIndex((c: any) => c.id === userResponse.choiceId)
                            question.isCorrect = userResponse.isCorrect

                            const correctChoiceId = correctChoiceMap[question.academyQuestionId]

                            // Update choices with isCorrect and isWrong
                            question.choices = question.choices.map((choice) => ({
                                ...choice,
                                isCorrect: choice.id === correctChoiceId,
                                isWrong: choice.id === userResponse.choiceId && !userResponse.isCorrect
                            }))
                        }
                        return question
                    })

                    set({ questions: questionsWithUserResponses })
                }
            } catch (error) {
                console.error('Error fetching user responses:', error)
            }
        },

        setQuests: (quests) => set({ quests }),

        fetchQuests: async (academyId) => {
            try {
                const response = await axiosInstance.get(`/api/verification-tasks/academy/${academyId}`)
                set({ quests: response.data || [] })
            } catch (error) {
                console.error('Error fetching quests:', error)
            }
        },

        checkAnswer: async (academyId, questionId, choiceId, telegramUserId) => {
            try {
                const response = await axiosInstance.post(`/api/academies/${academyId}/check-answer`, {
                    academyId,
                    questionId,
                    choiceId,
                    telegramUserId
                })
                return response.data
            } catch (error) {
                console.error('Error checking answer:', error)
                throw error
            }
        },

        saveResponse: async (academyId, questionId, choiceId, telegramUserId, isCorrect, pointsAwarded) => {
            try {
                await axiosInstance.post(`/api/academies/${academyId}/save-response`, {
                    academyId,
                    questionId,
                    choiceId,
                    telegramUserId,
                    isCorrect,
                    pointsAwarded
                })
            } catch (error) {
                console.error('Error saving response:', error)
                throw error
            }
        },

        submitQuiz: async (academyId: number, userId: number) => {
            try {
                await axiosInstance.post(`/api/academies/${academyId}/submit-quiz`, {
                    academyId,
                    userId
                })

                // Fetch notifications after submitting the quiz
                const { fetchNotifications } = useNotificationStore.getState()
                await fetchNotifications()

                // Optionally, fetch user total points if needed
                await get().fetchUserTotalPoints(userId)
            } catch (error) {
                console.error('Error submitting quiz:', error)
                throw error
            }
        },

        fetchUserTotalPoints: async (userId) => {
            try {
                const response = await axiosInstance.get(`/api/points/user/${userId}`)
                const userPoints = response.data
                const totalPoints = userPoints.reduce((sum: number, point: { value: number }) => sum + point.value, 0)
                useUserStore.setState((state) => ({
                    ...state,
                    totalPoints,
                    points: userPoints
                }))
            } catch (error) {
                console.error('Error fetching user total points:', error)
            }
        },

        fetchUserTotalRaffles: async (userId) => {
            try {
                const response = await axiosInstance.get(`/api/raffle/total/?userId=${userId}`)
                useUserStore.setState((state) => ({
                    ...state,
                    totalRaffles: response.data
                }))
            } catch (error) {
                console.error('Error fetching user total points:', error)
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
