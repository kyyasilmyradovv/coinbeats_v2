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
import useUserStore from '../store/useUserStore' // Import the user store
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

    useEffect(() => {
        // Hide the arrow after 3 seconds
        const timer = setTimeout(() => {
            setShowArrow(false)
        }, 3000)

        return () => clearTimeout(timer) // Cleanup the timeout if component unmounts
    }, [])

    useEffect(() => {
        if (academy) {
            fetchEarnedPoints().then(() => {
                fetchQuestions().then((questions) => {
                    fetchUserResponses(questions) // Fetch responses after fetching questions
                })
            })
            fetchQuests()
        }
    }, [academy])

    useEffect(() => {
        setCurrentSlideIndex(0)
    }, [activeFilter])

    const fetchEarnedPoints = async () => {
        try {
            const response = await axiosInstance.get(`/api/points/${userId}/${academy.id}`)
            const points = response.data.value || 0 // Ensure points is always a number
            setEarnedPoints(points)

            // Fetch questions regardless of points
            const questions = await fetchQuestions()

            if (points > 0) {
                // If points exist, fetch user responses and apply them
                await fetchUserResponses(questions)
            } else {
                // If no points, display questions without pre-filled responses
                setInitialAnswers(questions)
            }
        } catch (error) {
            console.error('Error fetching earned points:', error)
            // Fallback to fetching and displaying questions
            const questions = await fetchQuestions()
            setInitialAnswers(questions)
        }
    }

    const handleNavigateToDetail = () => {
        setActiveFilter(null)
    }

    const constructImageUrl = (url) => `https://subscribes.lt/${url}`

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
            setInitialAnswers(questionsWithUserResponses) // Set state with updated questions
        } catch (error) {
            console.error('Error fetching user responses:', error)
            setInitialAnswers(mappedQuestions) // Set state with questions even if user responses are missing
        }
    }

    const fetchQuestions = async () => {
        try {
            const response = await axiosInstance.get(`/api/academies/${academy.id}/questions`)
            const questions = response.data || [] // Ensure we always return an array

            // Map the questions without user responses
            const mappedQuestions = questions.map((question) => ({
                academyQuestionId: question.id,
                question: question.question,
                answer: question.answer,
                quizQuestion: question.quizQuestion,
                video: question.video,
                choices: question.choices.filter((choice) => choice.text !== ''), // Filter out empty choices
                selectedChoice: undefined,
                isCorrect: undefined
            }))

            console.log('Fetched and mapped questions:', mappedQuestions)
            return mappedQuestions
        } catch (error) {
            console.error('Error fetching questions:', error)
            return [] // Return an empty array if there's an error
        }
    }

    const fetchQuests = async () => {
        try {
            const response = await axiosInstance.get(`/api/academies/${academy.id}/quests`)
            setQuests(response.data || []) // Ensure quests is always an array
        } catch (error) {
            console.error('Error fetching quests:', error)
            setQuests([]) // Set quests to an empty array on error
        }
    }

    const handleChoiceClick = (questionIndex, choiceIndex) => {
        setInitialAnswers(initialAnswers.map((q, qi) => (qi === questionIndex ? { ...q, selectedChoice: choiceIndex } : q)))
    }

    const handleCheckAnswer = async (questionIndex) => {
        try {
            const question = initialAnswers[questionIndex]
            const selectedChoiceId = question.choices[question.selectedChoice]?.id

            // Check if the user has selected a choice
            if (!selectedChoiceId) {
                console.error('No choice selected.')
                return
            }

            // Post the selected choice to check if it is correct
            const response = await axiosInstance.post(`/api/academies/${academy.id}/check-answer`, {
                academyId: academy.id,
                questionId: question.academyQuestionId,
                choiceId: selectedChoiceId,
                telegramUserId: initData.user.id
            })

            const { correct, pointsAwarded } = response.data

            // Update the state to mark the correct/incorrect answers and disable further interaction
            setInitialAnswers(
                initialAnswers.map((q, qi) =>
                    qi === questionIndex
                        ? {
                              ...q,
                              isCorrect: correct,
                              choices: q.choices.map((choice, ci) => ({
                                  ...choice,
                                  isCorrect: choice.isCorrect || (ci === q.selectedChoice && correct), // Mark correct choice
                                  isWrong: ci === q.selectedChoice && !correct // Mark incorrect choice
                              }))
                          }
                        : q
                )
            )

            // Award points and trigger XP animation
            if (pointsAwarded > 0) {
                setEarnedPoints(earnedPoints + pointsAwarded)
                setCurrentPoints(pointsAwarded)
                triggerXPAnimation()
            }

            // Allow navigation to the next slide
            swiperRef.current.swiper.allowSlideNext = true
            swiperRef.current.swiper.update()
        } catch (error) {
            console.error('Error checking answer:', error)
        }
    }

    const handleNextQuestion = () => {
        if (currentSlideIndex === initialAnswers.length * 2 - 1) {
            // If it's the last question, show the completion screen
            setActiveFilter('completion')
        } else {
            swiperRef.current.swiper.slideNext()
        }
    }

    const handleCompleteAcademy = async () => {
        try {
            await axiosInstance.post(`/api/academies/${academy.id}/submit-quiz`, {
                academyId: academy.id,
                userId // Use the database user ID
            })

            // After submitting, fetch the earned points again to update the display
            fetchEarnedPoints()

            // Navigate to the completion slide
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

    const renderProgressbarWithArrows = () => {
        const totalSlides = initialAnswers.length * 2
        const completedSlides = currentSlideIndex + 1

        const handlePrevClick = () => {
            swiperRef.current.swiper.slidePrev()
        }

        const handleNextClick = () => {
            handleNextQuestion() // Move to next question or complete the academy
        }

        return (
            <div className="flex items-center justify-between mb-2 !mx-1 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm p-2">
                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700">
                    <Icon icon="mdi:arrow-left" className="text-gray-600 dark:text-gray-400 w-6 h-6 cursor-pointer" onClick={handlePrevClick} />
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
                    <Icon icon="mdi:arrow-right" className="text-gray-600 dark:text-gray-400 w-6 h-6 cursor-pointer" onClick={handleNextClick} />
                </div>
            </div>
        )
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
                            {/* Total Supply */}
                            <li>
                                <strong>Total Supply:</strong> {parsedAnswer.totalSupply || 'N/A'}
                            </li>

                            {/* Contract Address */}
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

                            {/* Other fields with clickable links */}
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
                                            value.join(', ') // Handle arrays
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

        // Handle general text answers
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

    // Helper function to detect valid URLs
    const isValidUrl = (string) => {
        try {
            new URL(string)
            return true
        } catch (_) {
            return false
        }
    }

    // Utility function to detect URLs and return them as clickable links in JSX
    const convertToClickableLinks = (text) => {
        if (typeof text !== 'string') return text // Check if the input is a string

        // Regex to detect links
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
                                question.isCorrect !== undefined &&
                                (choice.isCorrect
                                    ? 'bg-green-200 border border-green-500'
                                    : choiceIndex === question.selectedChoice
                                      ? 'bg-red-200 border border-red-500'
                                      : '')
                            } mb-2`}
                            onClick={() => handleChoiceClick(questionIndex, choiceIndex)}
                            style={{ pointerEvents: question.isCorrect !== undefined ? 'none' : 'auto' }}
                        >
                            <span className="mr-4">{choice.text}</span>
                            <Radio checked={question.selectedChoice === choiceIndex} readOnly />
                        </div>
                    ))}
                </Card>
                <Button
                    large
                    rounded
                    outline
                    onClick={
                        question.isCorrect !== undefined
                            ? questionIndex === initialAnswers.length - 1
                                ? handleCompleteAcademy
                                : handleNextQuestion
                            : () => handleCheckAnswer(questionIndex)
                    }
                    className="mt-4 mb-12"
                    style={{
                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                        color: '#fff'
                    }}
                    disabled={question.selectedChoice === undefined}
                >
                    {question.isCorrect !== undefined ? (questionIndex === initialAnswers.length - 1 ? 'Complete academy' : 'Next question') : 'Check Answer'}
                </Button>
            </SwiperSlide>
        )
    }

    const renderReadTab = () => (
        <>
            {renderProgressbarWithArrows()}
            <Swiper
                pagination={{ clickable: true }}
                onSlideChange={(swiper) => {
                    const newIndex = swiper.activeIndex
                    const questionIndex = Math.floor(newIndex / 2)
                    const isQuizSlide = newIndex % 2 !== 0

                    if (isQuizSlide && (initialAnswers[questionIndex].selectedChoice === undefined || initialAnswers[questionIndex].isCorrect === undefined)) {
                        swiper.allowSlideNext = false
                    } else {
                        swiper.allowSlideNext = true
                    }

                    setCurrentSlideIndex(newIndex)
                }}
                ref={swiperRef}
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
        </>
    )

    const renderWatchTab = () => (
        <>
            {renderProgressbarWithArrows()}
            <Swiper pagination={{ clickable: true }} ref={swiperRef}>
                {initialAnswers.length > 0 ? (
                    initialAnswers.map((question, index) => {
                        const videoUrl = question.video
                        let embedUrl = ''

                        if (videoUrl) {
                            const urlParams = new URLSearchParams(new URL(videoUrl).search)
                            const videoId = urlParams.get('v')
                            embedUrl = `https://www.youtube.com/embed/${videoId}`
                        }

                        return (
                            <React.Fragment key={`watch-tab-${index}`}>
                                <SwiperSlide key={`video-slide-${index}`}>
                                    <Card className="!my-2 !mx-1 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                                        <iframe
                                            width="100%"
                                            height="250"
                                            src={embedUrl}
                                            title={`Video ${index + 1}`}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
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
            return (
                <AcademyCompletionSlide
                    earnedPoints={earnedPoints}
                    totalPoints={academy.xp} // Pass the total academy points as a prop
                    academyName={academy.name}
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

    return (
        <Page className="bg-white dark:bg-gray-900">
            <Navbar />
            <Sidebar />

            {academy && (
                <div className="px-4 pt-2">
                    <div className="text-center">
                        <img
                            alt={academy.name}
                            className="h-18 w-18 rounded-full mb-2 mx-auto cursor-pointer"
                            src={constructImageUrl(academy.logoUrl)}
                            onClick={handleNavigateToDetail}
                        />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200 cursor-pointer" onClick={handleNavigateToDetail}>
                            {academy.name}
                        </h1>
                        <div className="flex justify-center gap-2 mt-4 mx-4">
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
                                <Card className="flex flex-row rounded-2xl !shadow-lg p-2 !mx-0 !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !py-0">
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

                        <div className="mt-4">{renderContent()}</div>
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
