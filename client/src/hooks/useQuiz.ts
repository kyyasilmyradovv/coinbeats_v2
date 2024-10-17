// client/src/hooks/useQuiz.ts

import { useState, useEffect, useRef } from 'react'
import axiosInstance from '../api/axiosInstance'

interface UseQuizProps {
    academy: any
    initData: any
    setUser: (user: any) => void
    setEarnedPoints: (points: number) => void
    setCurrentPoints: (points: number) => void
    setShowXPAnimation: (show: boolean) => void
}

export const useQuiz = ({ academy, initData, setUser, setEarnedPoints, setCurrentPoints, setShowXPAnimation }: UseQuizProps) => {
    const [initialAnswers, setInitialAnswers] = useState<any[]>([])
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [showIntro, setShowIntro] = useState(false)
    const [quizStarted, setQuizStarted] = useState(false)
    const [timer, setTimer] = useState(45)
    const [errorMessage, setErrorMessage] = useState('')

    const fetchQuestions = async () => {
        try {
            const response = await axiosInstance.get(`/api/academies/${academy.id}/questions`)
            const questions = response.data || []
            // Process questions
            setInitialAnswers(questions)
        } catch (error) {
            console.error('Error fetching questions:', error)
        }
    }

    useEffect(() => {
        if (academy) {
            fetchQuestions()
        }
    }, [academy])

    const handlePrevClick = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1)
            setErrorMessage('')
        }
    }

    const handleNextClick = () => {
        setCurrentSlideIndex(currentSlideIndex + 1)
        setErrorMessage('')
    }

    const handleStartQuiz = () => {
        setShowIntro(false)
        setQuizStarted(true)
        // Start timer
    }

    const handleBackToProduct = () => {
        // Handle back action
    }

    return {
        initialAnswers,
        currentSlideIndex,
        handlePrevClick,
        handleNextClick,
        showIntro,
        setShowIntro,
        quizStarted,
        setQuizStarted,
        handleStartQuiz,
        timer,
        setTimer,
        handleBackToProduct,
        errorMessage,
        setErrorMessage
    }
}
