// client/src/pages/AddVideoLessonsPage.tsx

import React, { useEffect, useState } from 'react'
import { Page, Block, List, ListInput, Button, Notification, Card } from 'konsta/react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import useAcademyStore from '../store/useAcademyStore'
import useCategoryChainStore from '../store/useCategoryChainStore'
import axios from '../api/axiosInstance' // Import Axios instance to fetch academy data
import Spinner from '../components/Spinner' // Import Spinner for loading state

const AddVideoLessonsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>() // Get academy ID from URL
    const navigate = useNavigate()
    const [rightPanelOpened, setRightPanelOpened] = useState(false)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [loading, setLoading] = useState(true) // Loading state

    const {
        initialAnswers,
        setInitialAnswer, // Use this to set the video URL in the initialAnswers state
        setPrefilledAcademyData,
        resetAcademyData,
        submitVideoLessons
    } = useAcademyStore()

    const { fetchCategoriesAndChains } = useCategoryChainStore()

    useEffect(() => {
        const fetchAcademyData = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`/api/academies/${id}`)
                setPrefilledAcademyData(response.data) // Populate academy data including videos
            } catch (error) {
                console.error('Error fetching academy data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAcademyData()
        fetchCategoriesAndChains()

        return () => {
            resetAcademyData()
            console.log('Academy store reset after leaving AddVideoLessonsPage.')
        }
    }, [id, setPrefilledAcademyData, resetAcademyData, fetchCategoriesAndChains])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        )
    }

    const handleVideoUrlChange = (index: number, url: string) => {
        setInitialAnswer(index, 'video', url) // Update the video field in initialAnswers
    }

    const handleSubmit = async () => {
        try {
            await submitVideoLessons(parseInt(id || '0', 10))
            setNotificationOpen(true)
            navigate('/my-academies')
        } catch (error) {
            console.error('Failed to submit video lessons:', error)
        }
    }

    const handleNotificationClose = () => {
        setNotificationOpen(false)
        navigate('/my-academies') // Redirect to My Academies page
    }

    const renderVideoLessonSlide = (questionIndex: number) => {
        const question = initialAnswers[questionIndex]
        if (!question) return null

        return (
            <Card key={`video-question-${questionIndex}`} className="mx-4 my-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 space-y-4">
                <h2 className="text-lg font-bold mb-4 text-center">Add Video Lesson</h2>
                <p className="font-medium mb-2">{`Question ${questionIndex + 1}: ${question.question}`}</p>
                <List>
                    <ListInput
                        label={`Video URL for Question ${questionIndex + 1}`}
                        type="textarea"
                        inputClassName="!resize-none"
                        outline
                        placeholder="Enter Video URL"
                        value={question.video || ''} // Use video from initialAnswers
                        onChange={(e) => handleVideoUrlChange(questionIndex, e.target.value)} // Update video URL in initialAnswers
                    />
                </List>
                {question.video && (
                    <div className="mt-4">
                        <iframe
                            width="100%"
                            height="315"
                            src={`https://www.youtube.com/embed/${new URL(question.video).searchParams.get('v')}`}
                            title={`Video for Question ${questionIndex + 1}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}
            </Card>
        )
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <Block>
                {initialAnswers.map((_, index) => renderVideoLessonSlide(index))}
                <Button onClick={handleSubmit} large raised className="w-full bg-brand-primary text-white mt-4 rounded-full">
                    Submit Video Lessons
                </Button>
            </Block>

            <Notification
                opened={notificationOpen}
                title="Success"
                text="You successfully added Video Lessons"
                button={<Button onClick={handleNotificationClose}>OK</Button>}
                onClose={handleNotificationClose}
            />
        </Page>
    )
}

export default AddVideoLessonsPage
