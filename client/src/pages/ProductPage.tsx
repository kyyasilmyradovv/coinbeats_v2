// client/src/pages/ProductPage.tsx

import React, { useState, useEffect, useRef } from 'react'
import { useInitData } from '@telegram-apps/sdk-react'
import { useLocation } from 'react-router-dom'
import { FaTwitter, FaFacebook, FaInstagram, FaTelegramPlane, FaDiscord, FaYoutube, FaEnvelope } from 'react-icons/fa'
import { Page, Card, Radio, Button, Block, Preloader, Dialog, Notification } from 'konsta/react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import TimerBar from '../components/ProductPage/TimerBar'
import ProgressBar from '../components/ProductPage/ProgressBar'
import DetailsCard from '../components/ProductPage/DetailsCard'
import SocialsCard from '../components/ProductPage/SocialsCard'
import RafflesCard from '../components/ProductPage/RafflesCard'
import LeaveConfirmationDialog from '../components/ProductPage/LeaveConfirmationDialog'
import PointsCollectedCard from '../components/ProductPage/PointsCollectedCard'
import IntroSlide from '../components/ProductPage/IntroSlide'
import AcademyCompletionSlide from '../components/AcademyCompletionSlide'
import useUserStore from '../store/useUserStore'
import useAcademiesStore from '../store/useAcademiesStore'
import useUserVerificationStore, { VerificationTask } from '../store/useUserVerificationStore'
import coinStackIcon from '../images/coin-stack.png'
import coinbeats from '../images/coinbeats-l.svg'
import { Icon } from '@iconify/react'
import coinStack from '../images/coin-stack.png'
import bunnyImage from '../images/bunny-head.png'
import Linkify from 'react-linkify'
import { extractYouTubeVideoId } from '../utils/extractYouTubeVideoId'
import Lottie from 'react-lottie'
import coinsEarnedAnimationData from '../animations/earned-coins.json'
import bunnyLogo from '../images/bunny-head.png'

// Import platform logos
import xLogo from '../images/x.png'
import telegramLogo from '../images/x.png'
import youtubeLogo from '../images/x.png'
import instagramLogo from '../images/x.png'
import discordLogo from '../images/x.png'
import emailLogo from '../images/x.png'
import defaultLogo from '../images/x.png'
import { X } from '@mui/icons-material'

const platformLogos: { [key: string]: string } = {
    X: xLogo,
    Telegram: telegramLogo,
    YouTube: youtubeLogo,
    Instagram: instagramLogo,
    Discord: discordLogo,
    Email: emailLogo
}

const platformIcons: { [key: string]: JSX.Element } = {
    X: <FaTwitter className="w-8 h-8 text-blue-500" />,
    FACEBOOK: <FaFacebook className="w-8 h-8 text-blue-700" />,
    INSTAGRAM: <FaInstagram className="w-8 h-8 text-pink-500" />,
    TELEGRAM: <FaTelegramPlane className="w-8 h-8 text-blue-400" />,
    DISCORD: <FaDiscord className="w-8 h-8 text-indigo-600" />,
    YOUTUBE: <FaYoutube className="w-8 h-8 text-red-600" />,
    EMAIL: <FaEnvelope className="w-8 h-8 text-green-500" />,
    NONE: <img src={coinbeats} alt="CoinBeats" className="w-8 h-8" />
    // Add any other platforms as needed
}

export default function ProductPage() {
    const initData = useInitData()
    const location = useLocation()
    const { academy } = location.state || {}
    const [activeFilter, setActiveFilter] = useState<string | null>(null)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [currentPoints, setCurrentPoints] = useState(0)
    const [showXPAnimation, setShowXPAnimation] = useState(false)
    const swiperRef = useRef<any>(null)
    const { userId, setUser, referralCode } = useUserStore((state) => ({
        userId: state.userId,
        setUser: state.setUser,
        referralCode: state.referralCode
    }))
    const {
        userVerificationTasks,
        fetchUserVerificationTasks,
        startTask,
        submitTask,
        completeTask,
        getActionLabel,
        requiresInputField,
        getInputPlaceholder,
        performAction
    } = useUserVerificationStore((state) => ({
        userVerificationTasks: state.userVerificationTasks,
        fetchUserVerificationTasks: state.fetchUserVerificationTasks,
        startTask: state.startTask,
        submitTask: state.submitTask,
        completeTask: state.completeTask,
        getActionLabel: state.getActionLabel,
        requiresInputField: state.requiresInputField,
        getInputPlaceholder: state.getInputPlaceholder,
        performAction: state.performAction
    }))
    const {
        earnedPoints,
        fetchEarnedPoints,
        fetchQuestions,
        fetchUserResponses,
        fetchQuests,
        checkAnswer,
        saveResponse,
        submitQuiz,
        fetchUserTotalPoints,
        questions,
        quests
    } = useAcademiesStore((state) => ({
        earnedPoints: state.earnedPoints,
        fetchEarnedPoints: state.fetchEarnedPoints,
        fetchQuestions: state.fetchQuestions,
        fetchUserResponses: state.fetchUserResponses,
        fetchQuests: state.fetchQuests,
        checkAnswer: state.checkAnswer,
        saveResponse: state.saveResponse,
        submitQuiz: state.submitQuiz,
        fetchUserTotalPoints: state.fetchUserTotalPoints,
        questions: state.questions,
        quests: state.quests
    }))
    const [showArrow, setShowArrow] = useState(true)
    const [userHasResponses, setUserHasResponses] = useState(false)
    const [initialAnswers, setInitialAnswers] = useState<Question[]>([])
    const [showIntro, setShowIntro] = useState(false)
    const [loadingQuests, setLoadingQuests] = useState(true)
    const nextRaffleDate = new Date('2024-10-12T14:00:00') // 12th October, 2pm
    const raffles = [
        {
            date: new Date('2024-10-12T14:00:00'),
            reward: '200 USDC',
            winners: '10 x 20 USDC'
        },
        {
            date: new Date('2024-10-20T14:00:00'),
            reward: '200 USDC',
            winners: '10 x 20 USDC'
        },
        {
            date: new Date('2024-10-28T14:00:00'),
            reward: '200 USDC',
            winners: '10 x 20 USDC'
        }
    ]

    const [timeRemainingList, setTimeRemainingList] = useState<string[]>([])
    const [visibleTooltip, setVisibleTooltip] = useState<number | null>(null)
    const toggleTooltip = (tooltipIndex: number) => {
        if (visibleTooltip === tooltipIndex) {
            setVisibleTooltip(null)
        } else {
            setVisibleTooltip(tooltipIndex)
            // Optionally close the tooltip after 5 seconds
            setTimeout(() => setVisibleTooltip(null), 5000)
        }
    }

    // Timer related state variables
    const [timer, setTimer] = useState(45)
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [quizStarted, setQuizStarted] = useState(false)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [errorMessage, setErrorMessage] = useState('')
    const [maxAllowedSlide, setMaxAllowedSlide] = useState(1) // Initialize to first quiz slide
    const [pendingActiveFilter, setPendingActiveFilter] = useState<string | null>(null)
    const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null)
    const [taskInputValues, setTaskInputValues] = useState<{ [key: number]: string }>({})
    const [submittedTasks, setSubmittedTasks] = useState<{ [key: number]: boolean }>({})
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)
    const activeFilterRef = useRef<string | null>(activeFilter)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [pendingNavigationAction, setPendingNavigationAction] = useState<(() => void) | null>(null)

    const checkAnswerButtonRefs = useRef<(HTMLDivElement | null)[]>([]) // Updated to an array of refs
    // Ref for the "Check Answer" buttons

    // Feedback handling state variables
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
    const [feedbackText, setFeedbackText] = useState('')

    const coinsEarnedAnimation = {
        loop: true,
        autoplay: true,
        animationData: coinsEarnedAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    const handleActionClick = async (task: VerificationTask) => {
        try {
            const { notificationText, referralLink } = await performAction(task, referralCode)

            if (notificationText) {
                setNotificationText(notificationText)
                setNotificationOpen(true)
            }

            if (referralLink) {
                setReferralLink(referralLink)
                setReferralModalOpen(true)
            }

            // Handle any additional UI updates as needed
            if (task.verificationMethod === 'LEAVE_FEEDBACK') {
                setSelectedTask(task)
                setFeedbackDialogOpen(true)
            }
        } catch (error) {
            console.error('Error performing action:', error)
        }
    }

    const handleNavigationAttempt = (newFilter: string | null, navigationAction: () => void) => {
        const currentFilter = activeFilterRef.current

        if (
            (currentFilter === 'read' || currentFilter === 'watch') &&
            newFilter !== 'read' &&
            newFilter !== 'watch' &&
            hasAnsweredAtLeastOneQuestion() // Changed from !hasAnsweredAtLeastOneQuestion()
        ) {
            setPendingNavigationAction(() => navigationAction)
            setShowLeaveConfirmation(true)
        } else {
            navigationAction()
        }
    }

    // Define handlePrevClick and handleNextClick
    const handlePrevClick = () => {
        if (currentSlideIndex > 0 && swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slidePrev()
            setErrorMessage('') // Reset error message when moving back
        }
    }

    useEffect(() => {
        if (academy) {
            fetchEarnedPoints(userId, academy.id)
            fetchQuestions(academy.id)
            fetchUserResponses(userId, academy.id)
            fetchQuests(academy.id)
        }
    }, [academy])

    useEffect(() => {
        if (questions.length > 0) {
            setInitialAnswers(questions)
            const userHasResponses = questions.some((question) => question.isCorrect !== undefined)
            setUserHasResponses(userHasResponses)
            if (userHasResponses) {
                setShowIntro(false)
                const answeredSlides = questions.filter((q) => q.isCorrect !== undefined).length * 2 - 1
                setMaxAllowedSlide(answeredSlides)
            } else {
                setShowIntro(true)
                setMaxAllowedSlide(1)
            }
        }
    }, [questions])

    useEffect(() => {
        activeFilterRef.current = activeFilter
    }, [activeFilter])

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date()
            const newTimeRemainingList = raffles.map((raffle) => {
                const distance = raffle.date.getTime() - now.getTime()

                if (distance < 0) {
                    return 'Raffle has ended'
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24))
                const hours = Math.floor((distance / (1000 * 60 * 60)) % 24)
                const minutes = Math.floor((distance / (1000 * 60)) % 60)
                const seconds = Math.floor((distance / 1000) % 60)

                return `${days}d ${hours}h ${minutes}m ${seconds}s`
            })

            setTimeRemainingList(newTimeRemainingList)
        }

        updateTimer() // Update immediately

        const timerId = setInterval(updateTimer, 1000) // Update every second

        return () => clearInterval(timerId)
    }, [])

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
                setTimer(45) // Total time remains 45 seconds
                startTimer()
                setInitialAnswers((prevAnswers) => prevAnswers.map((q, qi) => (qi === currentQuestionIndex ? { ...q, timerStarted: true } : q)))
            }
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current) // Clear any existing timers
            }
        }
    }, [activeFilter, quizStarted, showIntro, currentQuestionIndex])

    const handleNavigateToDetail = () => {
        handleNavigationAttempt(null, () => setActiveFilter(null))
    }

    const handleBackToProduct = () => {
        setActiveFilter(null)
    }

    const constructImageUrl = (url: string) => `https://subscribes.lt/${url}`

    const handleChoiceClick = (questionIndex: number, choiceIndex: number) => {
        setInitialAnswers(initialAnswers.map((q, qi) => (qi === questionIndex ? { ...q, selectedChoice: choiceIndex } : q)))

        // Scroll to the "Check Answer" button for the current question
        if (checkAnswerButtonRefs.current[questionIndex]) {
            checkAnswerButtonRefs.current[questionIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
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

            const { correct, maxPoints, correctChoiceId } = await checkAnswer(academy.id, question.academyQuestionId, selectedChoiceId, initData.user.id)

            let pointsAwarded = 0

            if (correct) {
                const totalXP = maxPoints
                const basePoints = Math.floor(totalXP * 0.25)

                if (timer > 25) {
                    pointsAwarded = totalXP
                } else if (timer > 0) {
                    const remainingPoints = totalXP - basePoints
                    const elapsedSeconds = 25 - timer
                    const pointsDeducted = Math.floor((remainingPoints / 25) * elapsedSeconds)
                    pointsAwarded = totalXP - pointsDeducted
                } else {
                    pointsAwarded = basePoints
                }

                // Update earnedPoints from store
                fetchEarnedPoints(initData.user.id, academy.id)

                setCurrentPoints(pointsAwarded)
                triggerXPAnimation()
            }

            await saveResponse(academy.id, question.academyQuestionId, selectedChoiceId, initData.user.id, correct, pointsAwarded)

            // Update the question with the correct answers
            setInitialAnswers(
                initialAnswers.map((q, qi) =>
                    qi === questionIndex
                        ? {
                              ...q,
                              isCorrect: correct,
                              choices: q.choices.map((choice: any) => ({
                                  ...choice,
                                  isCorrect: choice.id === correctChoiceId,
                                  isWrong: choice.id === selectedChoiceId && !correct
                              }))
                          }
                        : q
                )
            )

            // Allow navigation to the next slide
            setMaxAllowedSlide((prev) => Math.min(prev + 2, initialAnswers.length * 2 - 1))
            setErrorMessage('')
        } catch (error) {
            console.error('Error checking answer:', error)
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
            await submitQuiz(academy.id, userId)

            // Fetch updated total points from the backend
            await fetchUserTotalPoints(userId)

            // Fetch updated earnedPoints
            fetchEarnedPoints(userId, academy.id)
            setActiveFilter('completion')
        } catch (error) {
            console.error('Error completing academy:', error)
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

    const renderReadTab = () => {
        if (showIntro) {
            return <IntroSlide handleBackToProduct={handleBackToProduct} handleStartQuiz={handleStartQuiz} />
        }

        const currentQuestion = initialAnswers[currentQuestionIndex]
        const totalSlides = initialAnswers.length * 2 // Each question has 2 slides

        // Decide whether to show the timer bar
        const showTimerBar = activeFilter === 'read' && quizStarted && timer >= 0 && currentQuestion && currentQuestion.isCorrect === undefined

        return (
            <>
                {showTimerBar && <TimerBar currentQuestion={currentQuestion} timer={timer} />}
                <ProgressBar
                    totalSlides={totalSlides}
                    currentSlideIndex={currentSlideIndex}
                    handlePrevClick={handlePrevClick}
                    handleNextClick={handleNextClick}
                />
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
            <SwiperSlide key={`quiz-question-${questionIndex}-${question.isCorrect}`}>
                <Card className="!mx-1 !my-2 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{question.quizQuestion}</p>
                </Card>
                <Card className="!my-4 !mx-1 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                    {question.choices.map((choice: any, choiceIndex: number) => {
                        const isSelected = question.selectedChoice === choiceIndex
                        const isCorrectChoice = choice.isCorrect
                        const isWrongChoice = choice.isWrong

                        let choiceClass = ''
                        if (question.isCorrect !== undefined) {
                            if (isCorrectChoice) {
                                choiceClass = 'bg-green-200 border border-green-500'
                            } else if (isWrongChoice) {
                                choiceClass = 'bg-red-200 border border-red-500'
                            }
                        } else if (isSelected) {
                            choiceClass = 'bg-purple-200 border border-purple-500'
                        }

                        return (
                            <div
                                key={choiceIndex}
                                className={`cursor-pointer p-4 rounded-lg flex justify-between items-center dark:bg-gray-700 dark:text-gray-200 ${choiceClass} mb-2`}
                                onClick={() => handleChoiceClick(questionIndex, choiceIndex)}
                                style={{ pointerEvents: question.isCorrect !== undefined ? 'none' : 'auto' }}
                            >
                                <span className="mr-4">{choice.text}</span>
                                <Radio checked={isSelected} readOnly />
                            </div>
                        )
                    })}
                </Card>
                {errorMessage && <p className="text-red-600 text-center mb-4">{errorMessage}</p>}
                <div
                    ref={(el) => {
                        checkAnswerButtonRefs.current[questionIndex] = el
                    }}
                >
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
                        {question.isCorrect !== undefined
                            ? questionIndex === initialAnswers.length - 1
                                ? 'Complete academy'
                                : 'Next question'
                            : 'Check Answer'}
                    </Button>
                </div>
            </SwiperSlide>
        )
    }

    const renderWatchTab = () => {
        const totalSlides = initialAnswers.length * 2 // Each question has 2 slides

        return (
            <>
                <ProgressBar
                    totalSlides={totalSlides}
                    currentSlideIndex={currentSlideIndex}
                    handlePrevClick={handlePrevClick}
                    handleNextClick={handleNextClick}
                />
                <Swiper
                    pagination={{ clickable: true }}
                    onSlideChange={handleSlideChange}
                    ref={swiperRef}
                    allowTouchMove={true}
                    initialSlide={currentSlideIndex}
                >
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
    }

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

    // Handle verify button click
    const handleVerifyClick = async (quest: VerificationTask) => {
        try {
            const message = await completeTask(quest.id, academy.id)
            setNotificationText(message)
            setNotificationOpen(true)
        } catch (error) {
            console.error('Error verifying quest:', error)
            const errorMessage = error.response?.data?.message || 'Verification failed.'
            setNotificationText(errorMessage)
            setNotificationOpen(true)
        }
    }

    // Render Quest Tab
    const renderQuestTab = () => (
        <Block className="!m-0 !p-0">
            {quests.length > 0 ? (
                quests.map((quest) => {
                    // For simplicity, we'll assume quests are not yet verified
                    const isVerified = false // Replace with actual verification status if available
                    return (
                        <div
                            key={quest.id}
                            className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg py-1 flex flex-row items-center px-1 border border-gray-300 dark:border-gray-600 h-16 justify-between w-full mb-2"
                        >
                            {/* Platform Icon */}
                            <div className="w-12 h-16 flex items-center justify-center">
                                {platformIcons[quest.platform] || <div className="w-8 h-8 text-gray-500">?</div>}
                            </div>

                            {/* Quest Details */}
                            <div className="flex flex-col flex-grow mx-2 py-1">
                                {/* Quest Name and Tooltip */}
                                <h3 className="font-semibold text-left break-words whitespace-normal text-xs flex items-center relative">
                                    {quest.name}
                                    <button
                                        className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center"
                                        onClick={() => toggleTooltip(quest.id)}
                                    >
                                        ?
                                    </button>
                                    {visibleTooltip === quest.id && (
                                        <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20">
                                            {quest.description}
                                            <button className="absolute top-0 right-0 text-white text-sm mt-1 mr-1" onClick={() => setVisibleTooltip(null)}>
                                                &times;
                                            </button>
                                        </div>
                                    )}
                                </h3>

                                {/* XP and Users Completed */}
                                <div className="flex items-center mt-1">
                                    <div className="flex items-center">
                                        <span className="mx-1 text-sm text-gray-100">+{quest.xp}</span>
                                        <img src={coinStackIcon} alt="Coin Stack" className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col space-y-1 justify-center mr-2">
                                {/* Action Button */}
                                <Button
                                    rounded
                                    onClick={() => handleActionClick(quest)}
                                    className="!text-2xs font-bold shadow-xl !w-20 !h-6"
                                    style={{
                                        background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                        color: '#fff'
                                    }}
                                >
                                    {getActionLabel(quest.verificationMethod)}
                                </Button>

                                {/* Verify Button */}
                                {quest.verificationMethod !== 'LEAVE_FEEDBACK' && (
                                    <Button
                                        rounded
                                        outline
                                        onClick={() => handleVerifyClick(quest)}
                                        className="!text-2xs font-bold shadow-xl !w-20 !h-6"
                                        style={{
                                            borderColor: isVerified ? '#16a34a' : '#3b82f6',
                                            backgroundColor: 'transparent',
                                            color: '#fff'
                                        }}
                                        disabled={isVerified}
                                    >
                                        {isVerified ? 'Completed' : 'Verify'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                })
            ) : (
                <div className="text-center text-white mt-4">No quests available.</div>
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
        handleNavigationAttempt(newFilter, () => setActiveFilter(newFilter))
    }

    return (
        <Page className="bg-white dark:bg-gray-900">
            <Navbar handleNavigationAttempt={handleNavigationAttempt} />
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
                                <DetailsCard academy={academy} />
                                <SocialsCard academy={academy} />
                                <RafflesCard
                                    raffles={raffles}
                                    timeRemainingList={timeRemainingList}
                                    toggleTooltip={toggleTooltip}
                                    visibleTooltip={visibleTooltip}
                                />
                                <PointsCollectedCard earnedPoints={earnedPoints} totalPoints={academy.xp} />
                            </>
                        )}

                        {activeFilter === null ? null : renderContent()}
                    </div>
                </div>
            )}

            <BottomTabBar activeTab={activeFilter} setActiveTab={setActiveFilter} handleNavigationAttempt={handleNavigationAttempt} />

            {showXPAnimation && (
                <div className="fixed inset-0 flex flex-col items-center justify-center z-50 animate-bookmark" style={{ pointerEvents: 'none' }}>
                    <img src={coinStack} alt="Coin Stack" className="h-16 w-16" />
                    <div className="text-gray-800 dark:text-white mt-4 text-md font-semibold">+{currentPoints}</div>
                </div>
            )}

            {/* Leave confirmation dialog */}
            <LeaveConfirmationDialog
                opened={showLeaveConfirmation}
                onConfirm={() => {
                    setShowLeaveConfirmation(false)
                    if (pendingNavigationAction) {
                        pendingNavigationAction()
                        setPendingNavigationAction(null)
                    }
                }}
                onCancel={() => {
                    setShowLeaveConfirmation(false)
                    setPendingNavigationAction(null)
                }}
            />

            {/* Notification Component */}
            <Notification
                className="fixed !mt-12 top-12 left-0 z-50 border"
                opened={notificationOpen}
                icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                title="Message from CoinBeats Bunny"
                text={notificationText}
                button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                onClose={() => setNotificationOpen(false)}
            />
        </Page>
    )
}
