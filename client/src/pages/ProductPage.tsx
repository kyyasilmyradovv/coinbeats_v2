// client/src/pages/ProductPage.tsx

import { useState, useEffect, useRef } from 'react'
import { useInitData } from '@telegram-apps/sdk-react'
import { useLocation } from 'react-router-dom'
import { FaTwitter, FaFacebook, FaInstagram, FaTelegramPlane, FaDiscord, FaYoutube, FaEnvelope, FaExchangeAlt } from 'react-icons/fa'
import { Page, Card, Radio, Button, Block, Notification, Preloader } from 'konsta/react'
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
import useSurpriseBoxStore from '~/store/useSurpriseBoxStore'
import useNotificationStore from '~/store/useNotificationStore'
import coinStackIcon from '../images/coin-stack.png'
import coinbeats from '../images/coinbeats-l.svg'
import coinStack from '../images/coin-stack.png'
import Linkify from 'react-linkify'
import { extractYouTubeVideoId } from '../utils/extractYouTubeVideoId'
import coinsEarnedAnimationData from '../animations/earned-coins.json'
import bunnyLogo from '../images/bunny-head.png'
import arrowDownIcon from '../images/down-arrow (1) 1.png'
import { handleAction, getActionLabel } from '../utils/actionHandlers' // Import from actionHandlers
import axiosInstance from '~/api/axiosInstance'

const platformIcons: { [key: string]: JSX.Element } = {
    X: <FaTwitter className="w-8 h-8 text-blue-500" />,
    FACEBOOK: <FaFacebook className="w-8 h-8 text-blue-700" />,
    INSTAGRAM: <FaInstagram className="w-8 h-8 text-pink-500" />,
    TELEGRAM: <FaTelegramPlane className="w-8 h-8 text-blue-400" />,
    DISCORD: <FaDiscord className="w-8 h-8 text-indigo-600" />,
    YOUTUBE: <FaYoutube className="w-8 h-8 text-red-600" />,
    EMAIL: <FaEnvelope className="w-8 h-8 text-green-500" />,
    NONE: <img src={coinbeats} alt="CoinBeats" className="w-8 h-8" />
}

export default function ProductPage() {
    const initData = useInitData()
    const location = useLocation()
    const { academy } = location.state || {}
    const [activeFilter, setActiveFilter] = useState<string | null>(null)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [currentPoints, setCurrentPoints] = useState(0)
    const [showXPAnimation, setShowXPAnimation] = useState(false)
    const [raffle, setRaffle] = useState<any>(null)
    const swiperRef = useRef<any>(null)
    const [loading, setLoading] = useState(false)

    const { userId, referralCode, twitterAuthenticated } = useUserStore((state) => ({
        userId: state.userId,
        referralCode: state.referralCode,
        twitterAuthenticated: state.twitterAuthenticated
    }))

    const { userVerificationTasks, fetchUserVerificationTasks, startTask, submitTask, completeTask } = useUserVerificationStore((state) => ({
        userVerificationTasks: state.userVerificationTasks,
        fetchUserVerificationTasks: state.fetchUserVerificationTasks,
        startTask: state.startTask,
        submitTask: state.submitTask,
        completeTask: state.completeTask
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

    const [timeRemainingList, setTimeRemainingList] = useState<string[]>([])
    const [visibleTooltip, setVisibleTooltip] = useState<number | null>(null)
    const toggleTooltip = (tooltipIndex: number) => {
        if (visibleTooltip === tooltipIndex) {
            setVisibleTooltip(null)
        } else {
            setVisibleTooltip(tooltipIndex)
            setTimeout(() => setVisibleTooltip(null), 5000)
        }
    }

    const [timer, setTimer] = useState(45)
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [quizStarted, setQuizStarted] = useState(false)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [errorMessage, setErrorMessage] = useState('')
    const [maxAllowedSlide, setMaxAllowedSlide] = useState(1)
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

    const checkAnswerButtonRefs = useRef<(HTMLDivElement | null)[]>([])
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
    const [feedbackText, setFeedbackText] = useState('')

    const scrollToInitial = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }

    const coinsEarnedAnimation = {
        loop: true,
        autoplay: true,
        animationData: coinsEarnedAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    const { loadSurpriseBoxData, setNextBox } = useSurpriseBoxStore()
    const { completedAcademies, nextBox } = useSurpriseBoxStore()
    const [surprisePoint, setSurprisePoint] = useState(0)
    const { fetchNotifications, showNotification } = useNotificationStore.getState()

    useEffect(() => {
        if (academy) {
            if (userId !== null) {
                fetchEarnedPoints(userId, academy.id)
            }
            fetchQuestions(academy.id)
            if (userId !== null) {
                fetchUserResponses(userId, academy.id)
            }
            fetchQuests(academy.id)
        }
    }, [academy])

    useEffect(() => {
        const fetchRaffle = async () => {
            if (academy?.id) {
                try {
                    const overallRaffle = await axiosInstance.get(`/api/academies/raffle?academyId=${academy?.id}`)
                    if (overallRaffle?.data) {
                        const today = new Date()
                        const deadline = new Date(overallRaffle.data.deadline)
                        const remainingTime = deadline.getTime() - today.getTime()

                        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24))
                        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
                        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000)

                        const countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`

                        setRaffle({ ...overallRaffle.data, countdown, overallRaffle })
                    }
                } catch (error) {}
            }
        }

        fetchRaffle()
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            const today = new Date()
            const deadline = new Date(raffle?.deadline)
            const remainingTime = deadline.getTime() - today.getTime()

            const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24))
            const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000)

            const countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`

            // Update the raffle state with the countdown
            setRaffle((prev: any) => ({
                ...prev,
                countdown
            }))
        }, 1000)

        return () => clearInterval(interval)
    }, [raffle])

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

    const handleNavigationAttempt = (newFilter: string | null, navigationAction: () => void) => {
        const currentFilter = activeFilterRef.current
        if ((currentFilter === 'read' || currentFilter === 'watch') && newFilter !== 'read' && newFilter !== 'watch' && hasAnsweredAtLeastOneQuestion()) {
            setPendingNavigationAction(() => navigationAction)
            setShowLeaveConfirmation(true)
        } else {
            navigationAction()
        }
    }

    const handlePrevClick = () => {
        // scrollToInitial()
        if (currentSlideIndex > 0 && swiperRef.current?.swiper) {
            swiperRef.current.swiper.slidePrev()
            setErrorMessage('')
        }
    }

    const handleNextClick = () => {
        // scrollToInitial()
        const isQuizSlide = currentSlideIndex % 2 === 1
        const questionIndex = Math.floor(currentSlideIndex / 2)
        if (isQuizSlide) {
            const currentQuestion = initialAnswers[questionIndex]
            if (currentQuestion.isCorrect !== undefined) {
                if (currentSlideIndex + 2 <= initialAnswers.length * 2 - 1) {
                    setMaxAllowedSlide((prev) => Math.min(prev + 2, initialAnswers.length * 2 - 1))
                }
                if (swiperRef.current?.swiper) {
                    swiperRef.current.swiper.slideNext()
                    setErrorMessage('')
                }
            } else {
                setErrorMessage('You must check your answer before proceeding.')
            }
        } else {
            if (swiperRef.current?.swiper) {
                swiperRef.current.swiper.slideNext()
                setErrorMessage('')
            }
        }
    }

    useEffect(() => {
        const arrowTimer = setTimeout(() => {
            setShowArrow(false)
        }, 3000)
        return () => clearTimeout(arrowTimer)
    }, [])

    useEffect(() => {
        if (activeFilter !== 'read' && activeFilter !== 'watch') {
            setCurrentSlideIndex(0)
            setMaxAllowedSlide(1)
        }
    }, [activeFilter])

    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
            }
        }
    }, [])

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
                clearInterval(timerIntervalRef.current)
            }
        }
    }, [activeFilter, quizStarted, showIntro, currentQuestionIndex])

    const handleNavigateToDetail = () => {
        handleNavigationAttempt(null, () => setActiveFilter(null))
    }

    const handleBackToProduct = () => {
        setActiveFilter(null)
    }

    const constructImageUrl = (url: string) => `https://telegram.coinbeats.xyz/${url}`

    const handleActionClick = async (task: VerificationTask) => {
        try {
            await handleAction(
                task,
                {
                    referralCode,
                    setReferralLink,
                    setReferralModalOpen,
                    setNotificationText,
                    setNotificationOpen,
                    setSelectedTask,
                    setFeedbackDialogOpen,
                    twitterAuthenticated: true, // Adjust if you have auth implemented
                    academyName: academy?.name,
                    twitterHandle: '',
                    telegramUserId: initData.user.id
                },
                academy?.id
            )
        } catch (error) {
            console.error('Error handling action:', error)
        }
    }

    const handleChoiceClick = (questionIndex: number, choiceIndex: number) => {
        setInitialAnswers(initialAnswers.map((q, qi) => (qi === questionIndex ? { ...q, selectedChoice: choiceIndex } : q)))
        if (checkAnswerButtonRefs.current[questionIndex]) {
            checkAnswerButtonRefs.current[questionIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    const handleCheckAnswer = async (questionIndex: number) => {
        if (loading) return
        const question = initialAnswers[questionIndex]
        const selectedChoiceId = question.choices[question.selectedChoice]?.id
        if (selectedChoiceId === undefined) {
            setErrorMessage('You must make a selection!')
            return
        }
        setErrorMessage('')
        setLoading(true)
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
                fetchEarnedPoints(userId, academy.id)
                setCurrentPoints(pointsAwarded)
                triggerXPAnimation()
            }
            await saveResponse(academy.id, question.academyQuestionId, selectedChoiceId, initData.user.id, correct, pointsAwarded)
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
            setMaxAllowedSlide((prev) => Math.min(prev + 2, initialAnswers.length * 2 - 1))
            setErrorMessage('')
            setLoading(false)
            // scrollToInitial()
        } catch (error) {
            setLoading(false)
            console.error('Error checking answer:', error)
        }
    }

    const handleNextQuestion = () => {
        const totalSlides = initialAnswers.length * 2
        if (currentSlideIndex >= totalSlides - 1) {
            handleCompleteAcademy()
        } else {
            if (swiperRef.current?.swiper) {
                swiperRef.current.swiper.slideNext()
                setErrorMessage('')
            } else {
                console.error('Swiper reference is not available.')
            }
        }
        scrollToInitial()
    }

    useEffect(() => {
        if (userId) {
            loadSurpriseBoxData(userId)
        }
    }, [userId])

    const handleCompleteAcademy = async () => {
        if (loading) return
        setLoading(true)
        try {
            await submitQuiz(academy.id, userId)
            await fetchUserTotalPoints(userId)
            fetchEarnedPoints(userId, academy.id)

            if (earnedPoints == 0) {
                const { increaseCompletedAcademies } = useSurpriseBoxStore.getState()
                increaseCompletedAcademies(userId)

                if (completedAcademies + 1 === nextBox) {
                    let randomSurprisePoint = (Math.floor(Math.random() * 10) + 1) * 500
                    setSurprisePoint(randomSurprisePoint)
                    setNextBox(userId, randomSurprisePoint)
                    const { totalPoints } = useUserStore.getState()
                    useUserStore.setState({ totalPoints: totalPoints + randomSurprisePoint })
                }
            }

            await fetchNotifications()
            const { notifications } = useNotificationStore.getState()
            const unreadNotification = notifications.find((notif) => !notif.read)
            if (unreadNotification) {
                showNotification(unreadNotification)
            }

            setActiveFilter('completion')
            setLoading(false)
        } catch (error) {
            setLoading(false)
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
        // scrollToInitial()
        const newIndex = swiper.activeIndex
        setCurrentSlideIndex(newIndex)
        const newQuestionIndex = Math.floor(newIndex / 2)
        setCurrentQuestionIndex(newQuestionIndex)
        const question = initialAnswers[newQuestionIndex]
        if (newIndex > maxAllowedSlide) {
            setErrorMessage('Please complete the current question before proceeding.')
            if (swiperRef.current?.swiper) {
                swiperRef.current.swiper.slideTo(maxAllowedSlide, 300)
            }
        } else {
            setErrorMessage('')
        }
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
        const totalSlides = initialAnswers.length * 2
        const showTimerBar = activeFilter === 'read' && quizStarted && timer >= 0 && currentQuestion && currentQuestion.isCorrect === undefined

        return (
            <>
                <ProgressBar
                    totalSlides={totalSlides}
                    currentSlideIndex={currentSlideIndex}
                    handlePrevClick={handlePrevClick}
                    handleNextClick={handleNextClick}
                />
                {/* {showTimerBar && (
                    <TimerBar currentQuestion={currentQuestion} timer={timer} totalSlides={initialAnswers?.length} currentSlideIndex={currentQuestionIndex} />
                )} */}

                <TimerBar currentQuestion={currentQuestion} timer={timer} totalSlides={initialAnswers?.length} currentSlideIndex={currentQuestionIndex} />

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
        if (initialAnswers.length > 0 && !initialAnswers[0].timerStarted) {
            startTimer()
            setInitialAnswers((prevAnswers) => prevAnswers.map((q, qi) => (qi === 0 ? { ...q, timerStarted: true } : q)))
        }
        if (swiperRef.current?.swiper) {
            swiperRef.current.swiper.slideTo(0, 0)
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
                    <Card className="!mt-2 mb-4 !mx-1 !p-4 pb-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm ">
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
                    <Button
                        large
                        rounded
                        outline
                        onClick={handleNextClick}
                        className="mb-4"
                        style={{
                            background: 'linear-gradient(180deg, #D52AE9 0%, #2E3772 100%)',
                            border: '1px solid #C400B2',
                            color: '#fff',
                            marginBottom: '60px'
                        }}
                    >
                        SEE QUESTION
                    </Button>
                </SwiperSlide>
            )
        }

        return (
            <SwiperSlide key={`initial-question-${questionIndex}`}>
                <Card className="!mt-2 !mx-1 !p-4 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm !mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{question.question}</h2>
                    <p className="text-gray-900 dark:text-gray-100" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                        <Linkify componentDecorator={linkDecorator}>{question.answer || ''}</Linkify>
                    </p>
                </Card>
                <Button
                    large
                    rounded
                    outline
                    onClick={handleNextClick}
                    className="mb-4"
                    style={{
                        background: 'linear-gradient(180deg, #D52AE9 0%, #2E3772 100%)',
                        border: '1px solid #C400B2',
                        color: '#fff'
                    }}
                >
                    SEE QUESTION
                </Button>
            </SwiperSlide>
        )
    }

    const renderQuizSlide = (questionIndex: number) => {
        const question = initialAnswers[questionIndex]

        if (!question) return null
        return (
            <SwiperSlide key={`quiz-question-${questionIndex}-${question.isCorrect}`}>
                <Card className="!my-4 !mx-1 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                    <div style={{ marginBottom: '40px' }}>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{question.quizQuestion}</p>
                        {/* <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{question.question === 'Tokenomics details' ? '' : question.answer}</p> */}
                    </div>
                    {question.choices.map((choice: any, choiceIndex: number) => {
                        const isSelected = question.selectedChoice === choiceIndex
                        const isCorrectChoice = choice.isCorrect
                        const isWrongChoice = choice.isWrong
                        let choiceClass = ''
                        if (question.isCorrect !== undefined) {
                            if (isCorrectChoice) {
                                choiceClass = 'bg-green-200 border border-[#00FF00]'
                            } else if (isWrongChoice) {
                                choiceClass = 'bg-red-200 border border-red-500'
                            }
                        } else if (isSelected) {
                            choiceClass = 'bg-#C400B2-200 border border-[#C400B2]'
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
                        className="mt-4 mb-14"
                        style={{
                            background: 'linear-gradient(180deg, #D52AE9 0%, #2E3772 100%)',
                            border: '1px solid #C400B2',
                            color: '#fff'
                        }}
                    >
                        {!loading &&
                            (question.isCorrect !== undefined
                                ? questionIndex === initialAnswers.length - 1
                                    ? 'Complete academy'
                                    : 'Next question'
                                : 'Check Answer')}
                        {loading && <Preloader size="small" style={{ color: 'white' }} />}
                    </Button>
                </div>
            </SwiperSlide>
        )
    }

    const renderWatchTab = () => {
        const firstVideoQuestion = initialAnswers.find((q) => q.video)
        if (!firstVideoQuestion || !firstVideoQuestion.video) {
            return (
                <Card className="m-2 p-2">
                    <p className="text-center">No tutorial video available</p>
                </Card>
            )
        }
        const videoUrl = firstVideoQuestion.video
        const videoId = extractYouTubeVideoId(videoUrl || '')
        const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : ''
        return (
            <Card className="!my-2 !mx-1 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                {embedUrl ? (
                    <iframe
                        width="100%"
                        height="315"
                        src={embedUrl}
                        title="Tutorial Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <p className="text-center text-red-500">Invalid video URL</p>
                )}
            </Card>
        )
    }

    const handleVerifyClick = async (quest: VerificationTask) => {
        try {
            const message = await completeTask(quest.id, academy.id)
            setNotificationText(message)
            setNotificationOpen(true)
        } catch (error) {
            console.error('Error verifying quest:', error)
            const errorMessage = (error as any).response?.data?.message || 'Verification failed.'
            setNotificationText(errorMessage)
            setNotificationOpen(true)
        }
    }

    const renderQuestTab = () => (
        <Block className="!m-0 !p-0">
            {quests.length > 0 ? (
                quests.map((quest) => {
                    const userVerification = userVerificationTasks.find(
                        (uv) => uv.verificationTaskId === quest.id && uv.academyId === academy.id && uv.userId === userId
                    )
                    const isVerified = userVerification?.verified || false
                    return (
                        <div
                            key={quest.id}
                            className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg py-1 flex flex-row items-center px-1 border border-gray-300 dark:border-gray-600 h-16 justify-between w-full mb-2"
                        >
                            <div className="w-12 h-16 flex items-center justify-center">
                                {platformIcons[quest.platform] || <div className="w-8 h-8 text-gray-500">?</div>}
                            </div>
                            <div className="flex flex-col flex-grow mx-2 py-1">
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
                                <div className="flex items-center mt-1">
                                    <div className="flex items-center">
                                        <span className="mx-1 text-sm text-gray-100">+{quest.xp}</span>
                                        <img src={coinStackIcon} alt="Coin Stack" className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-1 justify-center mr-2">
                                <Button
                                    rounded
                                    onClick={() => handleActionClick(quest)}
                                    className="!text-2xs font-bold shadow-xl !w-20 !h-6"
                                    style={{
                                        background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                        color: '#fff'
                                    }}
                                >
                                    {getActionLabel(quest.verificationMethod, twitterAuthenticated)}
                                </Button>

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
            return (
                <AcademyCompletionSlide
                    earnedPoints={earnedPoints}
                    totalPoints={academy.fomoNumber > academy.pointCount ? academy.fomoXp : academy.xp}
                    academyName={academy.name}
                    academyId={academy.id}
                    academyTwitter={academy.twitter}
                    surprisePoint={surprisePoint}
                />
            )
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

    useEffect(() => {
        if (userHasResponses) {
            setShowIntro(false)
            setQuizStarted(true)
        }
    }, [userHasResponses])

    const hasAnsweredAtLeastOneQuestion = () => {
        return initialAnswers.some((q) => q.isCorrect !== undefined)
    }

    const handleTabChange = (newFilter: string) => {
        handleNavigationAttempt(newFilter, () => setActiveFilter(newFilter))
    }
    return (
        <div className="bg-white dark:bg-gray-900">
            <Navbar handleNavigationAttempt={handleNavigationAttempt} />
            <Sidebar />
            {academy && (
                <div className="px-2">
                    <div
                        className={`relative w-full h-28 bg-cover bg-center rounded-b-2xl transition-all duration-500`}
                        style={{
                            backgroundImage: `url(${constructImageUrl(academy.coverPhotoUrl)})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div className="absolute inset-0 bg-black opacity-50 rounded-b-2xl"></div>
                        <div className={`relative text-center  flex items-center  justify-center transition-all duration-500`}>
                            <img
                                alt={academy.name}
                                className={`rounded-full z-10 relative h-15 w-15 mr-2 transition-all duration-500`}
                                src={constructImageUrl(academy.logoUrl)}
                                onClick={handleNavigateToDetail}
                            />
                            <h1
                                className={`text-white z-10 relative cursor-pointer text-2xl transition-all duration-500 font-bold`}
                                onClick={handleNavigateToDetail}
                            >
                                {academy.name}
                            </h1>
                        </div>
                    </div>
                    {activeFilter === null ? (
                        <div style={{ display: 'flex', marginTop: '20px', justifyContent: 'space-around', position: 'relative' }}>
                            <div style={{ height: '40px' }}>
                                <img
                                    src={arrowDownIcon}
                                    className={`bounce-arrow w-10 h-10 left-[13%] md:left-[15.5%]`}
                                    alt="academy ticker"
                                    style={{
                                        top: '-50px'
                                    }}
                                />
                            </div>
                            <Button
                                outline
                                rounded
                                onClick={() => handleTabChange('read')}
                                className={`${activeFilter === 'read' ? 'active-gradient shadow-lg' : 'default-gradient shadow-lg'} rounded-full`}
                                style={{
                                    background:
                                        activeFilter === 'read'
                                            ? 'linear-gradient(180deg, #B038A2 0%, #262881 100%)'
                                            : 'linear-gradient(180deg, #B038A2, #262881)',
                                    color: '#fff',
                                    border: activeFilter === 'read' ? '1px solid #C400B2' : '1px solid #C400B2',
                                    borderRadius: '20px',
                                    height: '40px'
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
                                    margin: '0 10px',
                                    background: !initialAnswers.some((question) => question.video)
                                        ? 'linear-gradient(to left, #808080, #b3b3b3)'
                                        : activeFilter === 'watch'
                                          ? 'linear-gradient(to left, #ff77aa, #aa77ff)'
                                          : 'linear-gradient(to left, #ff0077, #7700ff)',
                                    color: '#fff',
                                    border: !initialAnswers.some((question) => question.video)
                                        ? '1px solid #FFF'
                                        : activeFilter === 'watch'
                                          ? '2px solid #DE47F0'
                                          : '2px solid #DE47F0',
                                    borderRadius: '20px',
                                    height: '40px'
                                }}
                            >
                                Tutorial
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
                                    border: quests.length === 0 ? '1px solid #FFF' : activeFilter === 'quests' ? '2px solid #DE47F0' : '2px solid #DE47F0',
                                    borderRadius: '20px',
                                    height: '40px'
                                }}
                            >
                                Quests
                            </Button>
                        </div>
                    ) : null}

                    <div className="py-4">
                        {activeFilter === null && (
                            <>
                                <DetailsCard academy={academy} />
                                <SocialsCard academy={academy} />

                                <Button
                                    rounded
                                    outline
                                    onClick={() => window.open('https://t.me/tirador_bot?start=CoinBeats', '_blank')}
                                    className="flex items-center justify-center  w-full !text-xs font-bold shadow-xl !border !border-blue-400 mb-4"
                                    style={{
                                        background: 'linear-gradient(to right,#1CBF4D,#1890CC)',
                                        color: '#fff',
                                        gap: '10px'
                                    }}
                                >
                                    {/* Optional: Add an icon */}
                                    <FaExchangeAlt className="w-4 h-4 text-gray-300" /> {/* Icon from react-icons */}
                                    TRADE & SNIPE
                                </Button>

                                <PointsCollectedCard
                                    earnedPoints={earnedPoints}
                                    totalPoints={academy?.fomoNumber > academy?.pointCount ? academy.fomoXp : academy.xp}
                                    hasRaffle={!!raffle?.id}
                                />

                                {raffle?.id && <RafflesCard raffle={raffle} toggleTooltip={toggleTooltip} visibleTooltip={visibleTooltip} />}
                            </>
                        )}

                        {activeFilter === null ? null : renderContent()}
                    </div>
                </div>
            )}

            {showXPAnimation && (
                <div className="fixed inset-0 flex flex-col items-center justify-center z-50 animate-bookmark" style={{ pointerEvents: 'none' }}>
                    <img src={coinStack} alt="Coin Stack" className="h-16 w-16" />
                    <div className="text-gray-800 dark:text-white mt-4 text-md font-semibold">+{currentPoints}</div>
                </div>
            )}
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
            <Notification
                className="fixed !mt-12 top-12 left-0 z-50 border"
                opened={notificationOpen}
                icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                title="Message from CoinBeats Bunny"
                text={notificationText}
                button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                onClose={() => setNotificationOpen(false)}
            />
        </div>
    )
}
