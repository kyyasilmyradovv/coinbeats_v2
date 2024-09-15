// client/sec/pages/ProductPage.tsx

import React, { useState, useEffect, useRef } from 'react'
import { useInitData } from '@telegram-apps/sdk-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import { Page, Card, Radio, Button, Block } from 'konsta/react'
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
import useUserStore from '../store/useUserStore'
import AcademyCompletionSlide from '../components/AcademyCompletionSlide'

export default function ProductPage() {
    const initData = useInitData()
    const location = useLocation()
    const navigate = useNavigate()
    const { academy } = location.state || {}
    const [activeFilter, setActiveFilter] = useState(null)
    const [initialAnswers, setInitialAnswers] = useState([])
    const [quests, setQuests] = useState([])
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [earnedPoints, setEarnedPoints] = useState(0)
    const [currentPoints, setCurrentPoints] = useState(0)
    const [showXPAnimation, setShowXPAnimation] = useState(false)
    const swiperRef = useRef(null)
    const userId = useUserStore((state) => state.userId)
    const [showArrow, setShowArrow] = useState(true)
    const [userHasResponses, setUserHasResponses] = useState(false)
    const [showIntro, setShowIntro] = useState(false)

    // Timer related state variables
    const [timer, setTimer] = useState(45)
    const timerIntervalRef = useRef(null)
    const [quizStarted, setQuizStarted] = useState(false)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [errorMessage, setErrorMessage] = useState('')
    const [allowNext, setAllowNext] = useState(false) // New state to control navigation

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
        }
    }, [academy])

    useEffect(() => {
        setCurrentSlideIndex(0)
    }, [activeFilter])

    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
            }
        }
    }, [])

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
            } else {
                setUserHasResponses(false)
                setShowIntro(true) // Show intro if no responses
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

            const mappedQuestions = questions.map((question) => ({
                academyQuestionId: question.id,
                question: question.question,
                answer: question.answer,
                quizQuestion: question.quizQuestion,
                video: question.video,
                xp: question.xp,
                choices: question.choices.filter((choice) => choice.text !== ''),
                selectedChoice: undefined,
                isCorrect: undefined,
                timerStarted: false // Track if timer started for the question
            }))

            console.log('Fetched and mapped questions:', mappedQuestions)
            return mappedQuestions
        } catch (error) {
            console.error('Error fetching questions:', error.response ? error.response.data : error.message)
            return []
        }
    }

    const fetchUserResponses = async (mappedQuestions) => {
        try {
            if (isNaN(academy.id)) {
                throw new Error('Invalid academy ID')
            }

            const response = await axiosInstance.get(`/api/academies/${userId}/${academy.id}`)
            const userResponses = response.data || []

            // Apply user responses to the questions
            const questionsWithUserResponses = mappedQuestions.map((question) => {
                const userResponse = userResponses.find((r) => r.choice.academyQuestionId === question.academyQuestionId)
                if (userResponse) {
                    question.selectedChoice = question.choices.findIndex((c) => c.id === userResponse.choiceId)
                    question.isCorrect = userResponse.isCorrect
                }
                return question
            })

            console.log('Questions with user responses applied:', questionsWithUserResponses)
            setInitialAnswers(questionsWithUserResponses)
            return userResponses
        } catch (error) {
            console.error('Error fetching user responses:', error.response ? error.response.data : error.message)
            // Set initialAnswers to mappedQuestions without user responses
            setInitialAnswers(mappedQuestions)
            return null
        }
    }

    const fetchQuests = async () => {
        try {
            const response = await axiosInstance.get(`/api/academies/${academy.id}/quests`)
            setQuests(response.data || [])
        } catch (error) {
            console.error('Error fetching quests:', error.response ? error.response.data : error.message)
            setQuests([])
        }
    }

    const handleNavigateToDetail = () => {
        setActiveFilter(null)
    }

    const handleBackToProduct = () => {
        setActiveFilter(null)
    }

    const constructImageUrl = (url) => `https://subscribes.lt/${url}`

    const handleChoiceClick = (questionIndex, choiceIndex) => {
        setInitialAnswers(initialAnswers.map((q, qi) => (qi === questionIndex ? { ...q, selectedChoice: choiceIndex } : q)))
    }

    const handleCheckAnswer = async (questionIndex) => {
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
                              choices: q.choices.map((choice, ci) => ({
                                  ...choice,
                                  isCorrect: choice.isCorrect || (ci === q.selectedChoice && correct),
                                  isWrong: ci === q.selectedChoice && !correct
                              }))
                          }
                        : q
                )
            )

            // Allow navigation to the next slide
            setAllowNext(true)
        } catch (error) {
            console.error('Error checking answer:', error.response ? error.response.data : error.message)
        }
    }

    const handleNextQuestion = () => {
        const totalSlides = initialAnswers.length * 2
        if (currentSlideIndex >= totalSlides - 1) {
            setActiveFilter('completion')
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

    const handleSlideChange = (swiper) => {
        const newIndex = swiper.activeIndex
        setCurrentSlideIndex(newIndex)
        setCurrentQuestionIndex(Math.floor(newIndex / 2))

        const questionIndex = Math.floor(newIndex / 2)
        const question = initialAnswers[questionIndex]

        if (question && !question.timerStarted) {
            startTimer()
            setInitialAnswers((prevAnswers) => prevAnswers.map((q, qi) => (qi === questionIndex ? { ...q, timerStarted: true } : q)))
        } else if (question && question.isCorrect === undefined) {
            // If the question is not answered, reset the timer
            setTimer(45)
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
            }
            startTimer()
        }
    }

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
                setAllowNext(false) // Reset for the next question
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

    const renderProgressbarWithArrows = () => {
        const totalSlides = initialAnswers.length * 2 // Each question has 2 slides
        const completedSlides = currentSlideIndex

        return (
            <div className="flex items-center justify-between mb-2 !mx-1 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm p-2">
                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700">
                    <Icon
                        icon="mdi:arrow-left"
                        className={`text-gray-600 dark:text-gray-400 w-6 h-6 cursor-pointer ${currentSlideIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handlePrevClick} // Now properly defined
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
                        onClick={handleNextClick} // Now properly defined
                    />
                </div>
            </div>
        )
    }

    const renderTimerBar = () => {
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
            <div className="flex items-center justify-between mb-2">
                <div className="text-gray-900 dark:text-gray-300 text-md font-semibold flex w-8 h-8 items-center justify-center text-center">
                    +{displayedPoints} <img src={coinStack} alt="coin stack" className="w-4 h-4 mr-1 mb-[4px]" />
                </div>
                <div className="relative flex-grow h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 right-0 h-full rounded-full"
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
        return (
            <>
                {quizStarted && timer >= 0 && renderTimerBar()}
                {renderProgressbarWithArrows()}
                <Swiper
                    pagination={{ clickable: true }}
                    onSlideChange={handleSlideChange}
                    ref={swiperRef}
                    allowTouchMove={false} // Disable free swiping
                >
                    {initialAnswers.length > 0 ? (
                        initialAnswers.flatMap((_, index) => [renderInitialQuestionSlide(index), renderQuizSlide(index)])
                    ) : (
                        <SwiperSlide>
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
                    <Button outline rounded onClick={() => handleBackToProduct()} className="!text-xs">
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
        setTimer(45)
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

    const renderInitialQuestionSlide = (questionIndex) => {
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
                                <strong>Total Supply:</strong> {parsedAnswer.totalSupply || 'N/A'}
                            </li>
                            <li>
                                <strong>Contract Address:</strong>{' '}
                                {parsedAnswer.contractAddress ? (
                                    <a href={parsedAnswer.contractAddress} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        {parsedAnswer.contractAddress}
                                    </a>
                                ) : (
                                    'N/A'
                                )}
                            </li>
                            {Object.entries(parsedAnswer).map(([key, value]) => {
                                if (key === 'totalSupply' || key === 'contractAddress') return null
                                return (
                                    <li key={key} className="mb-2 break-words">
                                        <strong className="capitalize">{key}:</strong>{' '}
                                        {typeof value === 'string' && isValidUrl(value) ? (
                                            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                                {value}
                                            </a>
                                        ) : Array.isArray(value) ? (
                                            value.join(', ')
                                        ) : (
                                            value
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </Card>
                </SwiperSlide>
            )
        }

        const formattedAnswer = convertToClickableLinks(question.answer || '')

        return (
            <SwiperSlide key={`initial-question-${questionIndex}`}>
                <Card className="!my-2 !mx-1 !p-4 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm !mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{question.question}</h2>
                    <p className="text-gray-900 dark:text-gray-100">{formattedAnswer}</p>
                </Card>
            </SwiperSlide>
        )
    }

    const isValidUrl = (string) => {
        try {
            new URL(string)
            return true
        } catch (_) {
            return false
        }
    }

    const convertToClickableLinks = (text) => {
        if (typeof text !== 'string') return text

        const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
        const parts = text.split(urlPattern)

        return parts.map((part, index) =>
            urlPattern.test(part) ? (
                <a
                    key={index}
                    href={part.startsWith('http') ? part : `http://${part}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                >
                    {part}
                </a>
            ) : (
                part
            )
        )
    }

    const renderQuizSlide = (questionIndex) => {
        const question = initialAnswers[questionIndex]
        if (!question) return null

        return (
            <SwiperSlide key={`quiz-question-${questionIndex}`}>
                <Card className="!mx-1 !my-2 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{question.quizQuestion}</p>
                </Card>
                <Card className="!my-4 !mx-1 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                    {question.choices.map((choice, choiceIndex) => (
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
            <Swiper pagination={{ clickable: true }} ref={swiperRef}>
                {initialAnswers.length > 0 ? (
                    initialAnswers.map((question, index) => {
                        const videoUrl = question.video
                        let embedUrl = ''

                        if (videoUrl) {
                            try {
                                const urlParams = new URLSearchParams(new URL(videoUrl).search)
                                const videoId = urlParams.get('v')
                                embedUrl = `https://www.youtube.com/embed/${videoId}`
                            } catch (error) {
                                console.error('Invalid video URL:', videoUrl)
                            }
                        }

                        return (
                            <React.Fragment key={`watch-tab-${index}`}>
                                <SwiperSlide key={`video-slide-${index}`}>
                                    <Card className="!my-2 !mx-1 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                                        {embedUrl ? (
                                            <iframe
                                                width="100%"
                                                height="250"
                                                src={embedUrl}
                                                title={`Video ${index + 1}`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <p className="text-center">Invalid video URL</p>
                                        )}
                                    </Card>
                                </SwiperSlide>
                                {renderQuizSlide(index)}
                            </React.Fragment>
                        )
                    })
                ) : (
                    <SwiperSlide>
                        <Card className="m-2 p-2">
                            <p className="text-center">No videos available</p>
                        </Card>
                    </SwiperSlide>
                )}
            </Swiper>
        </>
    )

    const renderQuestTab = () => (
        <Block>
            {quests.length > 0 ? (
                quests.map((quest, index) => (
                    <Card
                        key={index}
                        className="m-2 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm flex justify-between"
                    >
                        <span className="text-gray-900 dark:text-gray-200">{quest.name}</span>
                    </Card>
                ))
            ) : (
                <Card className="m-2 p-2">
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

    return (
        <Page className="bg-white dark:bg-gray-900">
            <Navbar />
            <Sidebar />

            {academy && (
                <div className="px-4 pt-2">
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
                                onClick={() => setActiveFilter('read')}
                                className={`${
                                    activeFilter === 'read'
                                        ? 'bg-gray-100 dark:bg-gray-700 k-color-brand-purple shadow-lg'
                                        : 'bg-white dark:bg-gray-800 shadow-lg'
                                }`}
                            >
                                Read
                            </Button>
                            <Button
                                outline
                                rounded
                                onClick={() => setActiveFilter('watch')}
                                className={`${
                                    activeFilter === 'watch'
                                        ? 'bg-gray-100 dark:bg-gray-700 k-color-brand-purple shadow-lg'
                                        : 'bg-white dark:bg-gray-800 shadow-lg'
                                } ${!initialAnswers.some((question) => question.video) ? 'bg-black text-gray-500 border-gray-500 cursor-not-allowed' : ''}`}
                                disabled={!initialAnswers.some((question) => question.video)}
                            >
                                Watch
                            </Button>
                            <Button
                                outline
                                rounded
                                onClick={() => setActiveFilter('quests')}
                                className={`${
                                    activeFilter === 'quests'
                                        ? 'bg-gray-100 dark:bg-gray-700 k-color-brand-purple shadow-lg'
                                        : 'bg-white dark:bg-gray-800 shadow-lg'
                                } ${quests.length === 0 ? 'bg-black text-gray-500 border-gray-500 cursor-not-allowed' : ''}`}
                                disabled={quests.length === 0}
                            >
                                Quests
                            </Button>
                        </div>
                    </div>

                    <div className="p-4">
                        {activeFilter === null && (
                            <>
                                <Card className="flex flex-col rounded-2xl !shadow-lg p-2 !mx-0 !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !py-0">
                                    <div className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200">
                                        <img src={name} className="h-10 w-10 mr-4" alt="academy name" />
                                        <span className="text-gray-600 dark:text-gray-400 mr-2">Name:</span>
                                        <span className="text-black dark:text-gray-200 font-semibold truncate">{academy.name}</span>
                                    </div>
                                    <div className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200">
                                        <img src={coins} className="h-10 w-10 mr-4" alt="coins to earn" />
                                        <span className="text-gray-600 dark:text-gray-400 mr-2">Coins to earn:</span>
                                        <span className="text-black dark:text-gray-200 font-semibold">{academy.xp}</span>
                                    </div>
                                    <div className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200">
                                        <img src={ticker} className="h-10 w-10 mr-4" alt="academy ticker" />
                                        <span className="text-gray-600 dark:text-gray-400 mr-2">Ticker:</span>
                                        <span className="text-black dark:text-gray-200 font-semibold">{academy.ticker}</span>
                                        {academy.dexScreener && (
                                            <a href={academy.dexScreener} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                                <Icon icon="mdi:arrow-right-bold" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200">
                                        <img src={categories} className="h-10 w-10 mr-4" alt="academy categories" />
                                        <span className="text-gray-600 dark:text-gray-400 mr-2">Categories:</span>
                                        <span className="text-black dark:text-gray-200 font-semibold truncate">
                                            {academy.categories.map((c) => c.name).join(', ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200">
                                        <img src={chains} className="h-10 w-10 mr-4" alt="academy chains" />
                                        <span className="text-gray-600 dark:text-gray-400 mr-2">Chains:</span>
                                        <span className="text-black dark:text-gray-200 font-semibold truncate">
                                            {academy.chains.map((c) => c.name).join(', ')}
                                        </span>
                                    </div>
                                </Card>

                                <Card className="rounded-2xl !shadow-lg p-2 !mx-0 !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !mb-4">
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        {academy.webpageUrl && (
                                            <Button
                                                clear
                                                raised
                                                className="flex items-center justify-center gap-2 w-full dark:text-gray-200"
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
                                                className="flex items-center justify-center gap-2 w-full dark:text-gray-200"
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
                                                className="flex items-center justify-center gap-2 dark:text-gray-200"
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
                                                className="flex items-center justify-center gap-2 dark:text-gray-200"
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
                                                className="flex items-center justify-center gap-2 w-full dark:text-gray-200"
                                                onClick={() => window.open(academy.coingecko, '_blank')}
                                            >
                                                <img src={gecko} className="h-5 w-5" alt="Coingecko logo" />
                                                COINGECKO
                                            </Button>
                                        )}
                                    </div>
                                </Card>

                                <Card className="flex flex-row rounded-2xl !shadow-lg p-2 !mx-0 !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !mb-12">
                                    <div className="flex items-center justify-center text-gray-900 dark:text-gray-200">
                                        <img src={collected} className="h-10 w-10 mr-4" alt="collected coins" />
                                        <span className="text-lg text-gray-600 dark:text-gray-400 mr-2">Earned Coins:</span>
                                        <span className="text-lg text-black dark:text-gray-200 font-semibold">
                                            {earnedPoints}/{academy.xp}
                                        </span>
                                    </div>
                                </Card>
                            </>
                        )}

                        {activeFilter === null ? <></> : showIntro ? renderIntroSlide() : renderContent()}
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
        </Page>
    )
}
