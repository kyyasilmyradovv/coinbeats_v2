// client/src/pages/ProductPage.tsx

import React, { useState, useEffect, useRef } from 'react'
import { useInitData } from '@telegram-apps/sdk-react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import { Page, Card, Radio, Button, Block, Preloader, Dialog } from 'konsta/react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
import axiosInstance from '../api/axiosInstance'
import { Icon } from '@iconify/react'
import collected from '../images/collected-coins.png'
import coins from '../images/coins-to-earn.png'
import ticker from '../images/ticker.png'
import categories from '../images/categories.png'
import chains from '../images/chains.png'
import name from '../images/name.png'
import gecko from '../images/coingecko.svg'
import coinStack from '../images/coin-stack.png'
import bunnyImage from '../images/bunny-head.png'
import useUserStore from '../store/useUserStore'
import AcademyCompletionSlide from '../components/AcademyCompletionSlide'
import Linkify from 'react-linkify'
import { extractYouTubeVideoId } from '../utils/extractYouTubeVideoId'

// Import platform logos
import xLogo from '../images/x.png'
import telegramLogo from '../images/x.png'
import youtubeLogo from '../images/x.png'
import instagramLogo from '../images/x.png'
import discordLogo from '../images/x.png'
import emailLogo from '../images/x.png'
import defaultLogo from '../images/x.png'

const platformLogos: { [key: string]: string } = {
    X: xLogo,
    Telegram: telegramLogo,
    YouTube: youtubeLogo,
    Instagram: instagramLogo,
    Discord: discordLogo,
    Email: emailLogo
}

export default function ProductPage() {
    const initData = useInitData()
    const location = useLocation()
    const { academy } = location.state || {}
    const [activeFilter, setActiveFilter] = useState<string | null>(null)
    const [initialAnswers, setInitialAnswers] = useState<any[]>([])
    const [quests, setQuests] = useState<any[]>([])
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [earnedPoints, setEarnedPoints] = useState(0)
    const [currentPoints, setCurrentPoints] = useState(0)
    const [showXPAnimation, setShowXPAnimation] = useState(false)
    const swiperRef = useRef<any>(null)
    const userId = useUserStore((state) => state.userId)
    const [showArrow, setShowArrow] = useState(true)
    const [userHasResponses, setUserHasResponses] = useState(false)
    const [showIntro, setShowIntro] = useState(false)
    const [loadingQuests, setLoadingQuests] = useState(true)

    // Timer related state variables
    const [timer, setTimer] = useState(45)
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [quizStarted, setQuizStarted] = useState(false)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [errorMessage, setErrorMessage] = useState('')
    const [maxAllowedSlide, setMaxAllowedSlide] = useState(1) // Initialize to first quiz slide
    const [pendingActiveFilter, setPendingActiveFilter] = useState<string | null>(null)
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)
    const activeFilterRef = useRef<string | null>(activeFilter)

    useEffect(() => {
        activeFilterRef.current = activeFilter
    }, [activeFilter])

    // Define handlePrevClick and handleNextClick
    const handlePrevClick = () => {
        if (currentSlideIndex > 0 && swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slidePrev()
            setErrorMessage('') // Reset error message when moving back
        }
    }

    const handleNextClick = () => {
        const isQuizSlide = currentSlideIndex % 2 === 1 // Odd indices are quiz slides
        const questionIndex = Math.floor(currentSlideIndex / 2)

        if (isQuizSlide) {
            const currentQuestion = initialAnswers[questionIndex]
            if (currentQuestion.isCorrect !== undefined) {
                // Allow moving to the next question
                if (currentSlideIndex + 2 <= initialAnswers.length * 2 - 1) {
                    setMaxAllowedSlide((prev) => Math.min(prev + 2, initialAnswers.length * 2 - 1))
                }
                if (swiperRef.current && swiperRef.current.swiper) {
                    swiperRef.current.swiper.slideNext()
                    setErrorMessage('') // Reset error message
                }
            } else {
                setErrorMessage('You must check your answer before proceeding.')
            }
        } else {
            // Allow moving to the quiz slide of the current question
            if (swiperRef.current && swiperRef.current.swiper) {
                swiperRef.current.swiper.slideNext()
                setErrorMessage('') // Reset error message
            }
        }
    }

    useEffect(() => {
        // Hide the arrow after 3 seconds
        const arrowTimer = setTimeout(() => {
            setShowArrow(false)
        }, 3000)

        return () => clearTimeout(arrowTimer)
    }, [])

    useEffect(() => {
        if (academy) {
            fetchEarnedPoints()
            fetchQuests()
            fetchQuestions()
        }
    }, [academy])

    useEffect(() => {
        // Only reset maxAllowedSlide when navigating away from 'read' or 'watch' tabs
        if (activeFilter !== 'read' && activeFilter !== 'watch') {
            setCurrentSlideIndex(0)
            setMaxAllowedSlide(1) // Reset maxAllowedSlide
        }
    }, [activeFilter])

    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
            }
        }
    }, [])

    // Timer management based on activeFilter
    useEffect(() => {
        if (activeFilter === 'read' && quizStarted && !showIntro) {
            const question = initialAnswers[currentQuestionIndex]
            if (question && !question.timerStarted) {
                setTimer(45)
                startTimer()
                setInitialAnswers((prevAnswers) => prevAnswers.map((q, qi) => (qi === currentQuestionIndex ? { ...q, timerStarted: true } : q)))
            }
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current) // Clear any existing timers
            }
        }
    }, [activeFilter, quizStarted, showIntro, currentQuestionIndex])

    const fetchEarnedPoints = async () => {
        try {
            // Fetch points
            const pointsResponse = await axiosInstance.get(`/api/points/${userId}/${academy.id}`)
            const points = pointsResponse.data.value || 0
            setEarnedPoints(points)
        } catch (error) {
            console.error('Error fetching earned points:', error.response ? error.response.data : error.message)
            setEarnedPoints(0)
        }

        // Fetch questions
        const questions = await fetchQuestions()

        try {
            // Fetch user responses
            const userResponses = await fetchUserResponses(questions)
            if (userResponses && userResponses.length > 0) {
                setUserHasResponses(true)
                setShowIntro(false) // Skip intro if there are existing responses
                // Update maxAllowedSlide based on answered questions
                const answeredSlides = userResponses.length * 2 - 1
                setMaxAllowedSlide(answeredSlides)
            } else {
                setUserHasResponses(false)
                setShowIntro(true) // Show intro if no responses
                setInitialAnswers(questions)
            }
        } catch (error) {
            console.error('Error fetching user responses:', error.response ? error.response.data : error.message)
            setUserHasResponses(false)
            setShowIntro(true)
            setInitialAnswers(questions)
        }
    }

    const fetchQuestions = async () => {
        try {
            const response = await axiosInstance.get(`/api/academies/${academy.id}/questions`)
            const questions = response.data || []

            const mappedQuestions = questions.map((question: any) => ({
                academyQuestionId: question.id,
                initialQuestionId: question.initialQuestionId,
                question: question.question,
                answer: question.answer,
                quizQuestion: question.quizQuestion,
                video: question.video,
                xp: question.xp,
                choices: question.choices.filter((choice: any) => choice.text !== ''),
                selectedChoice: undefined,
                isCorrect: undefined,
                timerStarted: false // Track if timer started for the question
            }))

            // Sort the questions based on initialQuestionId
            const sortedQuestions = mappedQuestions.sort((a, b) => a.initialQuestionId - b.initialQuestionId)

            console.log('Fetched and mapped questions:', sortedQuestions)
            return sortedQuestions
        } catch (error) {
            console.error('Error fetching questions:', error.response ? error.response.data : error.message)
            return []
        }
    }

    const fetchUserResponses = async (mappedQuestions: any[]) => {
        try {
            const response = await axiosInstance.get(`/api/academies/${userId}/${academy.id}`)
            const userResponses = response.data || []

            // Apply user responses to the questions
            const questionsWithUserResponses = mappedQuestions.map((question) => {
                const userResponse = userResponses.find((r: any) => r.choice.academyQuestionId === question.academyQuestionId)
                if (userResponse) {
                    question.selectedChoice = question.choices.findIndex((c: any) => c.id === userResponse.choiceId)
                    question.isCorrect = userResponse.isCorrect
                }
                return question
            })

            // Sort the questions based on initialQuestionId
            const sortedQuestions = questionsWithUserResponses.sort((a, b) => a.initialQuestionId - b.initialQuestionId)

            console.log('Questions with user responses applied:', sortedQuestions)
            setInitialAnswers(sortedQuestions)

            return userResponses // Return the user responses
        } catch (error) {
            console.error('Error fetching user responses:', error.response ? error.response.data : error.message)
            // Set initialAnswers to mappedQuestions without user responses
            setInitialAnswers(mappedQuestions)
            return null // Return null to indicate failure
        }
    }

    // Fetch quests (tasks) when component mounts
    const fetchQuests = async () => {
        try {
            const response = await axiosInstance.get(`/api/verification-tasks/academy/${academy.id}`)
            setQuests(response.data || [])
        } catch (error) {
            console.error('Error fetching quests:', error.response ? error.response.data : error.message)
            setQuests([])
        } finally {
            setLoadingQuests(false)
        }
    }

    const handleNavigateToDetail = () => {
        setActiveFilter(null)
    }

    const handleBackToProduct = () => {
        setActiveFilter(null)
    }

    const constructImageUrl = (url: string) => `https://subscribes.lt/${url}`

    const handleChoiceClick = (questionIndex: number, choiceIndex: number) => {
        setInitialAnswers(initialAnswers.map((q, qi) => (qi === questionIndex ? { ...q, selectedChoice: choiceIndex } : q)))
    }

    const handleCheckAnswer = async (questionIndex: number) => {
        const question = initialAnswers[questionIndex]
        const selectedChoiceId = question.choices[question.selectedChoice]?.id

        if (selectedChoiceId === undefined) {
            setErrorMessage('You must make a selection!')
            return
        }

        setErrorMessage('') // Clear error message

        try {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
            }

            const response = await axiosInstance.post(`/api/academies/${academy.id}/check-answer`, {
                academyId: academy.id,
                questionId: question.academyQuestionId,
                choiceId: selectedChoiceId,
                telegramUserId: initData.user.id
            })

            const { correct, maxPoints } = response.data

            let pointsAwarded = 0

            if (correct) {
                const totalXP = maxPoints
                const basePoints = Math.floor(totalXP * 0.25)

                if (timer > 30) {
                    pointsAwarded = totalXP
                } else if (timer > 0) {
                    const remainingPoints = totalXP - basePoints
                    const elapsedSeconds = 30 - timer
                    const pointsDeducted = Math.floor((remainingPoints / 30) * elapsedSeconds)
                    pointsAwarded = totalXP - pointsDeducted
                } else {
                    pointsAwarded = basePoints
                }

                setEarnedPoints((prev) => prev + pointsAwarded)
                setCurrentPoints(pointsAwarded)
                triggerXPAnimation()
            }

            await axiosInstance.post(`/api/academies/${academy.id}/save-response`, {
                academyId: academy.id,
                questionId: question.academyQuestionId,
                choiceId: selectedChoiceId,
                telegramUserId: initData.user.id,
                isCorrect: correct,
                pointsAwarded: pointsAwarded
            })

            setInitialAnswers(
                initialAnswers.map((q, qi) =>
                    qi === questionIndex
                        ? {
                              ...q,
                              isCorrect: correct,
                              choices: q.choices.map((choice: any, ci: number) => ({
                                  ...choice,
                                  isCorrect: choice.isCorrect || (ci === q.selectedChoice && correct),
                                  isWrong: ci === q.selectedChoice && !correct
                              }))
                          }
                        : q
                )
            )

            // Allow navigation to the next slide
            setMaxAllowedSlide((prev) => Math.min(prev + 2, initialAnswers.length * 2 - 1))
            setErrorMessage('')
        } catch (error) {
            console.error('Error checking answer:', error.response ? error.response.data : error.message)
        }
    }

    const handleNextQuestion = () => {
        const totalSlides = initialAnswers.length * 2
        if (currentSlideIndex >= totalSlides - 1) {
            handleCompleteAcademy() // Invoke the API call function
        } else {
            if (swiperRef.current && swiperRef.current.swiper) {
                swiperRef.current.swiper.slideNext()
                setErrorMessage('') // Reset error message when moving to next question
            } else {
                console.error('Swiper reference is not available.')
            }
        }
    }

    const handleCompleteAcademy = async () => {
        try {
            await axiosInstance.post(`/api/academies/${academy.id}/submit-quiz`, {
                academyId: academy.id,
                userId
            })

            fetchEarnedPoints()
            setActiveFilter('completion')
        } catch (error) {
            console.error('Error completing academy:', error.response ? error.response.data : error.message)
        }
    }

    const triggerXPAnimation = () => {
        setShowXPAnimation(true)
        setTimeout(() => {
            setShowXPAnimation(false)
            setCurrentPoints(0)
        }, 3000)
    }

    const handleSlideChange = (swiper: any) => {
        const newIndex = swiper.activeIndex
        setCurrentSlideIndex(newIndex)

        const newQuestionIndex = Math.floor(newIndex / 2)
        setCurrentQuestionIndex(newQuestionIndex)

        const question = initialAnswers[newQuestionIndex]

        // Restrict navigation beyond allowed slides
        if (newIndex > maxAllowedSlide) {
            setErrorMessage('Please complete the current question before proceeding.')
            if (swiperRef.current && swiperRef.current.swiper) {
                swiperRef.current.swiper.slideTo(maxAllowedSlide, 300)
            }
        } else {
            setErrorMessage('')
        }

        // Start timer for new question on read tab
        if (activeFilter === 'read') {
            if (question && !question.timerStarted) {
                setTimer(45)
                startTimer()
                setInitialAnswers((prevAnswers) => prevAnswers.map((q, qi) => (qi === newQuestionIndex ? { ...q, timerStarted: true } : q)))
            }
        }
    }

    const renderProgressbarWithArrows = () => {
        const totalSlides = initialAnswers.length * 2 // Each question has 2 slides
        const completedSlides = currentSlideIndex

        return (
            <div className="flex items-center justify-between mb-2 !mx-1 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm p-2">
                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700">
                    <Icon
                        icon="mdi:arrow-left"
                        className={`text-gray-600 dark:text-gray-400 w-6 h-6 cursor-pointer ${currentSlideIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handlePrevClick}
                    />
                </div>
                <div className="relative flex-grow h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{
                            width: `${(completedSlides / totalSlides) * 100}%`,
                            background: 'linear-gradient(to right, #ff0077, #7700ff)'
                        }}
                    />
                </div>
                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700">
                    <Icon
                        icon="mdi:arrow-right"
                        className={`text-gray-600 dark:text-gray-400 w-6 h-6 cursor-pointer ${
                            currentSlideIndex >= totalSlides - 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleNextClick}
                    />
                </div>
            </div>
        )
    }

    const renderTimerBar = () => {
        if (activeFilter !== 'read') return null

        if (showIntro) {
            // Do not display timer on intro slide
            return null
        }

        const currentQuestion = initialAnswers[currentQuestionIndex]

        // Do not display timer if question is already answered
        if (currentQuestion && currentQuestion.isCorrect !== undefined) {
            return null
        }

        if (timer === 0) {
            return (
                <div className="text-center mb-2">
                    <div className="text-red-600 font-bold">Time is up!</div>
                    <div className="text-gray-500 text-sm">You now only get 25% if you answer right.</div>
                </div>
            )
        }

        const totalXP = currentQuestion?.xp || 0
        let displayedPoints = totalXP

        if (timer > 30) {
            displayedPoints = totalXP
        } else if (timer > 0) {
            const basePoints = Math.floor(totalXP * 0.25)
            const remainingPoints = totalXP - basePoints
            const elapsedSeconds = 30 - timer // Corrected calculation
            const pointsDeducted = Math.floor((remainingPoints / 30) * elapsedSeconds)
            displayedPoints = totalXP - pointsDeducted
        } else {
            displayedPoints = Math.floor(totalXP * 0.25)
        }

        const timePercentage = (timer / 45) * 100

        const getBarColor = () => {
            if (timer > 30) {
                return '#00FF00'
            } else {
                const progress = (30 - timer) / 30
                const hue = 120 - progress * 120
                return `hsl(${hue}, 100%, 50%)`
            }
        }

        return (
            <div className="flex items-center justify-between mb-2 gap-3">
                <div className="text-gray-900 dark:text-gray-300 text-md font-semibold flex w-8 h-8 items-center justify-center text-center ml-1">
                    +{displayedPoints} <img src={coinStack} alt="coin stack" className="w-4 h-4 mr-2 ml-2 mb-[4px]" />
                </div>
                <div className="relative flex-grow h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full rounded-full mx-2"
                        style={{
                            width: `${timePercentage}%`,
                            background: getBarColor()
                        }}
                    />
                </div>
                <div className="text-gray-900 dark:text-gray-300 dark:bg-slate-800 text-md font-semibold border-2 border-gray-600 rounded-full flex w-8 h-8 items-center justify-center text-center pt-[2px]">
                    {timer}
                </div>
            </div>
        )
    }

    const renderReadTab = () => {
        if (showIntro) {
            return renderIntroSlide()
        }

        return (
            <>
                {quizStarted && timer >= 0 && renderTimerBar()}
                {renderProgressbarWithArrows()}
                <Swiper
                    pagination={{ clickable: true }}
                    onSlideChange={handleSlideChange}
                    ref={swiperRef}
                    allowTouchMove={true}
                    initialSlide={currentSlideIndex}
                >
                    {initialAnswers.length > 0 ? (
                        initialAnswers.flatMap((_, index) => [renderInitialQuestionSlide(index), renderQuizSlide(index)])
                    ) : (
                        <SwiperSlide key="no-reading-materials">
                            <Card className="m-2 p-2">
                                <p className="text-center">No reading materials available</p>
                            </Card>
                        </SwiperSlide>
                    )}
                </Swiper>
                {errorMessage && <p className="text-red-600 text-center mt-2">{errorMessage}</p>}
            </>
        )
    }

    const renderIntroSlide = () => (
        <div className="p-1 mt-4">
            <Card className="!m-0 !p-2 text-center !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                <p>
                    You have <span className="text-white text-lg font-bold">15</span> ⏳ seconds to read the content and answer, after that the points are
                    starting to gradually decrease the next 30 seconds! If the bar runs out of time, then you will be rewarded only 25% of the total possible
                    points. <br />
                    <br />
                    <span className="text-lg font-semibold">Are you ready?</span>
                </p>
                <div className="flex justify-center mt-4 gap-4">
                    <Button outline rounded onClick={handleBackToProduct} className="!text-xs">
                        No, go back
                    </Button>
                    <Button
                        outline
                        rounded
                        onClick={handleStartQuiz}
                        style={{
                            background: 'linear-gradient(to left, #ff0077, #7700ff)',
                            color: '#fff'
                        }}
                    >
                        START
                    </Button>
                </div>
            </Card>
        </div>
    )

    const handleStartQuiz = () => {
        setShowIntro(false)
        setQuizStarted(true)

        // Start the timer for the first question before sliding
        if (initialAnswers.length > 0 && !initialAnswers[0].timerStarted) {
            startTimer()
            setInitialAnswers((prevAnswers) => prevAnswers.map((q, qi) => (qi === 0 ? { ...q, timerStarted: true } : q)))
        }

        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slideTo(0, 0) // Slide to the first question without animation
        } else {
            console.error('Swiper reference is not available.')
        }
    }

    const startTimer = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current)
        }
        timerIntervalRef.current = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(timerIntervalRef.current)
                    return 0
                }
                return prevTimer - 1
            })
        }, 1000)
    }

    // Define a custom decorator function with Tailwind classes for styling links
    const linkDecorator = (href: string, text: string, key: number) => (
        <a href={href} key={key} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
            {text}
        </a>
    )

    const renderInitialQuestionSlide = (questionIndex: number) => {
        const question = initialAnswers[questionIndex]
        if (!question) return null

        if (question.question === 'Tokenomics details' && question.answer) {
            let parsedAnswer = {}

            try {
                parsedAnswer = JSON.parse(question.answer)
            } catch (error) {
                console.error('Error parsing answer JSON:', error)
            }

            return (
                <SwiperSlide key={`initial-question-${questionIndex}`}>
                    <Card className="!my-2 !mx-1 !p-4 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm !mb-12">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{question.question}</h2>
                        <ul className="list-disc list-inside text-gray-900 dark:text-gray-100">
                            <li>
                                <strong>Total Supply:</strong> {parsedAnswer['totalSupply'] || 'N/A'}
                            </li>
                            <li>
                                <strong>Contract Address:</strong>{' '}
                                <Linkify componentDecorator={linkDecorator}>{parsedAnswer['contractAddress'] || 'N/A'}</Linkify>
                            </li>
                            {Object.entries(parsedAnswer).map(([key, value]) => {
                                if (key === 'totalSupply' || key === 'contractAddress') return null
                                return (
                                    <li key={key} className="mb-2 break-words">
                                        <strong className="capitalize">{key}:</strong>{' '}
                                        <Linkify componentDecorator={linkDecorator}>{Array.isArray(value) ? value.join(', ') : value}</Linkify>
                                    </li>
                                )
                            })}
                        </ul>
                    </Card>
                </SwiperSlide>
            )
        }

        // Use Linkify to wrap the answer text in the default case
        return (
            <SwiperSlide key={`initial-question-${questionIndex}`}>
                <Card className="!my-2 !mx-1 !p-4 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm !mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{question.question}</h2>
                    <p className="text-gray-900 dark:text-gray-100">
                        <Linkify componentDecorator={linkDecorator}>{question.answer || ''}</Linkify>
                    </p>
                </Card>
            </SwiperSlide>
        )
    }

    const renderQuizSlide = (questionIndex: number) => {
        const question = initialAnswers[questionIndex]
        if (!question) return null

        return (
            <SwiperSlide key={`quiz-question-${questionIndex}`}>
                <Card className="!mx-1 !my-2 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{question.quizQuestion}</p>
                </Card>
                <Card className="!my-4 !mx-1 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                    {question.choices.map((choice: any, choiceIndex: number) => (
                        <div
                            key={choiceIndex}
                            className={`cursor-pointer p-4 rounded-lg flex justify-between items-center dark:bg-gray-700 dark:text-gray-200 ${
                                question.isCorrect === undefined && question.selectedChoice === choiceIndex ? 'bg-purple-200 border border-purple-500' : ''
                            } ${
                                question.isCorrect !== undefined
                                    ? choice.isCorrect
                                        ? 'bg-green-200 border border-green-500'
                                        : choiceIndex === question.selectedChoice
                                          ? 'bg-red-200 border border-red-500'
                                          : ''
                                    : ''
                            } mb-2`}
                            onClick={() => handleChoiceClick(questionIndex, choiceIndex)}
                            style={{ pointerEvents: question.isCorrect !== undefined ? 'none' : 'auto' }}
                        >
                            <span className="mr-4">{choice.text}</span>
                            <Radio checked={question.selectedChoice === choiceIndex} readOnly />
                        </div>
                    ))}
                </Card>
                {errorMessage && <p className="text-red-600 text-center mb-4">{errorMessage}</p>}
                <Button
                    large
                    rounded
                    outline
                    onClick={() => {
                        if (question.isCorrect !== undefined) {
                            handleNextQuestion()
                        } else {
                            handleCheckAnswer(questionIndex)
                        }
                    }}
                    className="mt-4 mb-12"
                    style={{
                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                        color: '#fff'
                    }}
                >
                    {question.isCorrect !== undefined ? (questionIndex === initialAnswers.length - 1 ? 'Complete academy' : 'Next question') : 'Check Answer'}
                </Button>
            </SwiperSlide>
        )
    }

    const renderWatchTab = () => (
        <>
            {renderProgressbarWithArrows()}
            <Swiper pagination={{ clickable: true }} onSlideChange={handleSlideChange} ref={swiperRef} allowTouchMove={true} initialSlide={currentSlideIndex}>
                {initialAnswers.length > 0 ? (
                    initialAnswers.flatMap((question, index) => [renderVideoSlide(index), renderQuizSlide(index)])
                ) : (
                    <SwiperSlide key="no-videos">
                        <Card className="m-2 p-2">
                            <p className="text-center">No videos available</p>
                        </Card>
                    </SwiperSlide>
                )}
            </Swiper>
        </>
    )

    const renderVideoSlide = (questionIndex: number) => {
        const question = initialAnswers[questionIndex]
        if (!question) return null

        const videoUrl = question.video
        console.log('Video URL:', videoUrl)
        const videoId = extractYouTubeVideoId(videoUrl || '')
        const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : ''

        return (
            <SwiperSlide key={`video-slide-${questionIndex}`}>
                <Card className="!my-2 !mx-1 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                    {embedUrl ? (
                        <iframe
                            width="100%"
                            height="315"
                            src={embedUrl}
                            title={`Video ${questionIndex + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <p className="text-center text-red-500">Invalid video URL</p>
                    )}
                </Card>
            </SwiperSlide>
        )
    }

    // Handle action button click
    const handleAction = (quest: any) => {
        // Implement action based on verification method
        // For example, redirect to a URL or open a modal
        console.log('Action clicked for quest:', quest)
        // Placeholder action
        alert(`Performing action: ${getActionButtonText(quest.verificationMethod)}`)
    }

    // Handle verify button click
    const handleVerify = async (quest: any) => {
        // Implement verification logic
        // For example, make an API call to verify the quest
        console.log('Verify clicked for quest:', quest)
        try {
            const response = await axiosInstance.post(`/api/verification-tasks/${quest.id}/verify`, {
                userId,
                academyId: academy.id
            })
            alert('Verification successful!')
        } catch (error) {
            console.error('Error verifying quest:', error)
            alert('Verification failed.')
        }
    }

    // Get action button text based on verification method
    const getActionButtonText = (verificationMethod: string) => {
        switch (verificationMethod) {
            case 'FOLLOW_USER':
                return 'Follow'
            case 'TWEET':
                return 'Post on X'
            case 'RETWEET':
                return 'Retweet'
            case 'LIKE_TWEET':
                return 'Like Tweet'
            case 'ADD_TO_BIO':
                return 'Add to Bio'
            case 'JOIN_TELEGRAM_CHANNEL':
                return 'Join Channel'
            case 'INVITE_TELEGRAM_FRIEND':
                return 'Invite Friend'
            case 'SUBSCRIBE_YOUTUBE_CHANNEL':
                return 'Subscribe'
            case 'WATCH_YOUTUBE_VIDEO':
                return 'Watch Video'
            case 'FOLLOW_INSTAGRAM_USER':
                return 'Follow'
            case 'JOIN_DISCORD_CHANNEL':
                return 'Join Channel'
            case 'PROVIDE_EMAIL':
                return 'Provide Email'
            case 'SHORT_CIRCUIT':
                return 'Start Task'
            default:
                return 'Start Task'
        }
    }

    // Render Quest Tab
    const renderQuestTab = () => (
        <Block className="!m-0 !p-0">
            {loadingQuests ? (
                <div className="flex justify-center items-center mt-4">
                    <Preloader size="w-12 h-12" />
                </div>
            ) : quests.length > 0 ? (
                quests.map((quest, index) => (
                    <Card
                        key={index}
                        className="!m-0 !p-0 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm flex"
                    >
                        <div className="flex">
                            {/* Platform logo */}
                            <div className="flex-shrink-0">
                                <img src={platformLogos[quest.platform] || defaultLogo} alt={quest.platform} className="w-12 h-12" />
                            </div>
                            {/* Quest details */}
                            <div className="flex-grow mx-4">
                                <h3 className="text-lg font-semibold">{quest.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{quest.description}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-md font-semibold mr-1">+{quest.xp}</span>
                                    <img src={coinStack} alt="coin stack" className="w-5 h-5" />
                                </div>
                            </div>
                            {/* Action buttons */}
                            <div className="flex flex-col justify-between">
                                <Button
                                    small
                                    rounded
                                    outline
                                    onClick={() => handleAction(quest)}
                                    className="mb-2"
                                    style={{
                                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                        color: '#fff'
                                    }}
                                >
                                    {getActionButtonText(quest.verificationMethod)}
                                </Button>
                                <Button
                                    small
                                    rounded
                                    outline
                                    onClick={() => handleVerify(quest)}
                                    style={{
                                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                        color: '#fff'
                                    }}
                                >
                                    Verify
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <Card key="no-quests" className="m-2 p-2">
                    <p className="text-center">No quests available</p>
                </Card>
            )}
        </Block>
    )

    const renderContent = () => {
        if (activeFilter === 'completion') {
            return <AcademyCompletionSlide earnedPoints={earnedPoints} totalPoints={academy.xp} academyName={academy.name} />
        }

        switch (activeFilter) {
            case 'read':
                return renderReadTab()
            case 'watch':
                return renderWatchTab()
            case 'quests':
                return renderQuestTab()
            default:
                return null
        }
    }

    const [headerExpanded, setHeaderExpanded] = useState(true)

    useEffect(() => {
        if (activeFilter) {
            setHeaderExpanded(false)
        } else {
            setHeaderExpanded(true)
        }
    }, [activeFilter])

    // Set introSlideDismissed and quizStarted based on user responses
    useEffect(() => {
        if (userHasResponses) {
            setShowIntro(false)
            setQuizStarted(true)
            // Optionally, start timer for the first unanswered question if any
        }
    }, [userHasResponses])

    const hasAnsweredAtLeastOneQuestion = () => {
        return initialAnswers.some((q) => q.isCorrect !== undefined)
    }

    const handleTabChange = (newFilter: string) => {
        const currentFilter = activeFilterRef.current
        console.log('Current Filter:', currentFilter)
        console.log('New Filter:', newFilter)
        console.log('Has Answered At Least One Question:', hasAnsweredAtLeastOneQuestion())

        if ((currentFilter === 'read' || currentFilter === 'watch') && newFilter !== 'read' && newFilter !== 'watch' && !hasAnsweredAtLeastOneQuestion()) {
            setPendingActiveFilter(newFilter)
            setShowLeaveConfirmation(true)
        } else {
            setActiveFilter(newFilter)
        }
    }

    return (
        <Page className="bg-white dark:bg-gray-900">
            <Navbar />
            <Sidebar />

            {academy && (
                <div className="px-2">
                    <div
                        className={`relative w-full ${headerExpanded ? 'h-48' : 'h-28'} bg-cover bg-center rounded-b-2xl transition-all duration-500`}
                        style={{
                            backgroundImage: `url(${constructImageUrl(academy.coverPhotoUrl)})`
                        }}
                    >
                        <div className="absolute inset-0 bg-black opacity-50 rounded-b-2xl"></div>
                        <div
                            className={`relative text-center pt-4 flex items-center ${
                                headerExpanded ? 'flex-col' : 'flex-row px-4'
                            } justify-center transition-all duration-500`}
                        >
                            <img
                                alt={academy.name}
                                className={`rounded-full z-10 relative ${headerExpanded ? 'h-20 w-20 mb-2' : 'h-10 w-10 mr-4'} transition-all duration-500`}
                                src={constructImageUrl(academy.logoUrl)}
                                onClick={handleNavigateToDetail}
                            />
                            <h1
                                className={`text-white z-10 relative cursor-pointer ${headerExpanded ? 'text-3xl' : 'text-xl'} transition-all duration-500`}
                                onClick={handleNavigateToDetail}
                            >
                                {academy.name}
                            </h1>
                        </div>
                        <div className="flex justify-center gap-2 mt-4 mx-4 relative z-10">
                            <div className="relative flex-grow">
                                {showArrow && (
                                    <div className={`absolute ${!showArrow ? 'fade-out' : ''}`}>
                                        <Icon icon="mdi:arrow-down-bold" className="bounce-arrow w-10 h-10 bottom-0 left-9" color="#DE47F0" />
                                    </div>
                                )}
                            </div>
                            <Button
                                outline
                                rounded
                                onClick={() => handleTabChange('read')}
                                className={`${activeFilter === 'read' ? 'active-gradient shadow-lg' : 'default-gradient shadow-lg'} rounded-full`}
                                style={{
                                    background:
                                        activeFilter === 'read' ? 'linear-gradient(to left, #ff77aa, #aa77ff)' : 'linear-gradient(to left, #ff0077, #7700ff)',
                                    color: '#fff',
                                    border: activeFilter === 'read' ? '2px solid #DE47F0' : '2px solid #DE47F0',
                                    borderRadius: '9999px'
                                }}
                            >
                                Read
                            </Button>

                            <Button
                                outline
                                rounded
                                onClick={() => handleTabChange('watch')}
                                className={`${
                                    activeFilter === 'watch' ? 'active-gradient shadow-lg' : 'default-gradient shadow-lg'
                                } ${!initialAnswers.some((question) => question.video) ? 'disabled-gradient cursor-not-allowed' : ''} rounded-full`}
                                disabled={!initialAnswers.some((question) => question.video)}
                                style={{
                                    background: !initialAnswers.some((question) => question.video)
                                        ? 'linear-gradient(to left, #808080, #b3b3b3)'
                                        : activeFilter === 'watch'
                                          ? 'linear-gradient(to left, #ff77aa, #aa77ff)'
                                          : 'linear-gradient(to left, #ff0077, #7700ff)',
                                    color: '#fff',
                                    border: !initialAnswers.some((question) => question.video)
                                        ? '2px solid #b3b3b3'
                                        : activeFilter === 'watch'
                                          ? '2px solid #DE47F0'
                                          : '2px solid #DE47F0',
                                    borderRadius: '9999px'
                                }}
                            >
                                Watch
                            </Button>

                            <Button
                                outline
                                rounded
                                onClick={() => handleTabChange('quests')}
                                className={`${
                                    activeFilter === 'quests' ? 'active-gradient shadow-lg' : 'default-gradient shadow-lg'
                                } ${quests.length === 0 ? 'disabled-gradient cursor-not-allowed' : ''} rounded-full`}
                                disabled={quests.length === 0}
                                style={{
                                    background:
                                        quests.length === 0
                                            ? 'linear-gradient(to left, #808080, #b3b3b3)'
                                            : activeFilter === 'quests'
                                              ? 'linear-gradient(to left, #ff77aa, #aa77ff)'
                                              : 'linear-gradient(to left, #ff0077, #7700ff)',
                                    color: '#fff',
                                    border: quests.length === 0 ? '2px solid #b3b3b3' : activeFilter === 'quests' ? '2px solid #DE47F0' : '2px solid #DE47F0',
                                    borderRadius: '9999px'
                                }}
                            >
                                Quests
                            </Button>
                        </div>
                    </div>

                    <div className="px-4 py-4">
                        {activeFilter === null && (
                            <>
                                <Card className="!mb-4 !p-0 !rounded-2xl shadow-lg !m-0 relative border border-gray-300 dark:border-gray-600">
                                    <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                                        <img src={name} className="h-7 w-7 mr-4" alt="academy name" />
                                        <span className="text-gray-600 dark:text-gray-400 mr-2">Name:</span>
                                        <span className="text-black dark:text-gray-200 font-semibold truncate">{academy.name}</span>
                                    </div>
                                    <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                                        <img src={coins} className="h-7 w-7 mr-4" alt="coins to earn" />
                                        <span className="text-gray-600 dark:text-gray-400 mr-2">Coins to earn:</span>
                                        <span className="text-black dark:text-gray-200 font-semibold">{academy.xp}</span>
                                    </div>
                                    <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                                        <img src={ticker} className="h-7 w-7 mr-4" alt="academy ticker" />
                                        <span className="text-gray-600 dark:text-gray-400 mr-2">Ticker:</span>
                                        <span className="text-black dark:text-gray-200 font-semibold">{academy.ticker}</span>
                                        {academy.dexScreener && (
                                            <a href={academy.dexScreener} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                                <Icon icon="mdi:arrow-right-bold" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                                        <img src={categories} className="h-7 w-7 mr-4" alt="academy categories" />
                                        <span className="text-gray-600 dark:text-gray-400 mr-2">Categories:</span>
                                        <span className="text-black dark:text-gray-200 font-semibold truncate">
                                            {academy.categories.map((c: any) => c.name).join(', ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                                        <img src={chains} className="h-7 w-7 mr-4" alt="academy chains" />
                                        <span className="text-gray-600 dark:text-gray-400 mr-2">Chains:</span>
                                        <span className="text-black dark:text-gray-200 font-semibold truncate">
                                            {academy.chains.map((c: any) => c.name).join(', ')}
                                        </span>
                                    </div>
                                </Card>

                                <Card className="!mb-4 !p-0 !rounded-2xl shadow-lg !m-0 relative border border-gray-300 dark:border-gray-600">
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        {academy.webpageUrl && (
                                            <Button
                                                clear
                                                raised
                                                rounded
                                                className="flex items-center !justify-start gap-2 w-full dark:text-gray-200 !text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                                                onClick={() => window.open(academy.webpageUrl, '_blank')}
                                            >
                                                <Icon icon="mdi:web" color="#6c757d" className="w-5 h-5" />
                                                WEBSITE
                                            </Button>
                                        )}
                                        {academy.twitter && (
                                            <Button
                                                clear
                                                raised
                                                rounded
                                                className="flex items-center !justify-start gap-2 w-full dark:text-gray-200 !text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                                                onClick={() => window.open(academy.twitter, '_blank')}
                                            >
                                                <Icon icon="mdi:twitter" color="#1DA1F2" className="w-5 h-5" />
                                                TWITTER
                                            </Button>
                                        )}
                                        {academy.telegram && (
                                            <Button
                                                clear
                                                raised
                                                rounded
                                                className="flex items-center !justify-start gap-2 w-full dark:text-gray-200 !text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                                                onClick={() => window.open(academy.telegram, '_blank')}
                                            >
                                                <Icon icon="mdi:telegram" color="#0088cc" className="w-5 h-5" />
                                                TELEGRAM
                                            </Button>
                                        )}
                                        {academy.discord && (
                                            <Button
                                                clear
                                                raised
                                                rounded
                                                className="flex items-center !justify-start gap-2 w-full dark:text-gray-200 !text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                                                onClick={() => window.open(academy.discord, '_blank')}
                                            >
                                                <Icon icon="mdi:discord" color="#7289DA" className="w-5 h-5" />
                                                DISCORD
                                            </Button>
                                        )}
                                        {academy.coingecko && (
                                            <Button
                                                clear
                                                raised
                                                rounded
                                                className="flex items-center !justify-start gap-2 w-full dark:text-gray-200 !text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                                                onClick={() => window.open(academy.coingecko, '_blank')}
                                            >
                                                <img src={gecko} className="h-5 w-5" alt="Coingecko logo" />
                                                COINGECKO
                                            </Button>
                                        )}
                                    </div>
                                </Card>

                                <Card className="!mb-12 !p-0 !rounded-2xl shadow-lg !m-0 relative border border-gray-300 dark:border-gray-600">
                                    <div className="flex items-center justify-center text-gray-900 dark:text-gray-200">
                                        <img src={collected} className="h-7 w-7 mr-4" alt="collected coins" />
                                        <span className="text-md text-gray-600 dark:text-gray-400 mr-2">Earned Coins:</span>
                                        <span className="text-md text-black dark:text-gray-200 font-semibold">
                                            {earnedPoints}/{academy.xp}
                                        </span>
                                    </div>
                                </Card>
                            </>
                        )}

                        {activeFilter === null ? null : renderContent()}
                    </div>
                </div>
            )}

            <BottomTabBar activeTab="tab-1" setActiveTab={setActiveFilter} />

            {showXPAnimation && (
                <div className="fixed inset-0 flex flex-col items-center justify-center z-50 animate-bookmark" style={{ pointerEvents: 'none' }}>
                    <img src={coinStack} alt="Coin Stack" className="h-16 w-16" />
                    <div className="text-gray-800 dark:text-white mt-4 text-md font-semibold">+{currentPoints}</div>
                </div>
            )}

            {/* Leave confirmation dialog */}
            <Dialog opened={showLeaveConfirmation} onBackdropClick={() => setShowLeaveConfirmation(false)} className="rounded-2xl p-4">
                <div className="text-center">
                    <img src={bunnyImage} alt="Bunny" className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Are you sure you want to leave? Your points may be lost!</p>
                    <div className="flex justify-center mt-4 gap-4">
                        <Button
                            rounded
                            outline
                            onClick={() => {
                                setShowLeaveConfirmation(false)
                                // Proceed with tab change
                                setActiveFilter(pendingActiveFilter)
                            }}
                            style={{
                                background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                color: '#fff'
                            }}
                            className="!text-xs"
                        >
                            I'm sure
                        </Button>
                        <Button
                            rounded
                            outline
                            onClick={() => setShowLeaveConfirmation(false)}
                            className="!text-xs"
                            style={{
                                background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                color: '#fff'
                            }}
                        >
                            Let's continue
                        </Button>
                    </div>
                </div>
            </Dialog>
        </Page>
    )
}
