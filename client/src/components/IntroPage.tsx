import React, { useEffect, useRef } from 'react'
import './IntroPage.css' // Styles for the intro page
import introImage from '../images/intro.webp'
import coinbeatsText from '../images/coinbeats.png'
import schoolText from '../images/school.png'
import useAcademiesStore from '../store/useAcademiesStore'
import usePointsStore from '../store/usePointsStore'
import useLeaderboardStore from '../store/useLeaderboardStore'
import useTasksStore from '../store/useTasksStore'
import useUserVerificationStore from '../store/useUserVerificationStore'
import useCategoryChainStore from '../store/useCategoryChainStore'
import { useInitData } from '@telegram-apps/sdk-react'
import useSessionStore from '../store/useSessionStore'
import useUserStore from '../store/useUserStore'

interface IntroPageProps {
    onComplete: () => void // Function to call when the intro is complete
}

const IntroPage: React.FC<IntroPageProps> = ({ onComplete }) => {
    const initData = useInitData()
    const initializedRef = useRef(false)

    const { fetchAcademiesAndPreloadImages } = useAcademiesStore()
    const { fetchUserPoints } = usePointsStore()
    const { fetchLeaderboards } = useLeaderboardStore()
    const { fetchVerificationTasks, fetchGameTasks } = useTasksStore()
    const { fetchUserVerificationTasks } = useUserVerificationStore()
    const { fetchCategoriesAndChains } = useCategoryChainStore()

    const { fetchUser, registerUser, referralCompletionChecked, checkReferralCompletion } = useUserStore()
    const { startSession } = useSessionStore()

    useEffect(() => {
        if (!initData || !initData.user || initializedRef.current) return
        initializedRef.current = true

        const removeSpinner = () => {
            const spinner = document.getElementById('initial-spinner')
            if (spinner) {
                spinner.remove()
            }
        }

        removeSpinner()

        const initializeUserSession = async () => {
            try {
                const telegramUserId = initData.user.id
                const username = initData.user.username || initData.user.firstName || initData.user.lastName || 'Guest'

                // Get referralCode from initData.startParam
                const referralCode = initData.startParam || null

                // Set telegramUserId in useSessionStore before any axios requests
                useSessionStore.setState({ userId: telegramUserId })

                let userRoles: string[] = ['USER'] // Default roles

                try {
                    // Attempt to fetch existing user data using store method
                    await fetchUser(telegramUserId)

                    // Access roles from store
                    const roles = useUserStore.getState().roles
                    userRoles = roles || ['USER']
                } catch (error: any) {
                    if (error.response && error.response.status === 404) {
                        // User not found, register using store method
                        await registerUser(telegramUserId, username, referralCode)

                        // Access roles from store
                        const roles = useUserStore.getState().roles
                        userRoles = roles || ['USER']
                    } else {
                        console.error('Error fetching user:', error)
                        // Handle other errors if necessary
                        // Set default values in case of error
                        useUserStore.setState({
                            userId: null,
                            username: 'Guest',
                            email: '',
                            emailConfirmed: false,
                            roles: ['USER'],
                            totalPoints: 0,
                            points: [],
                            bookmarks: [],
                            authenticated: false,
                            token: null,
                            hasAcademy: false,
                            referralPointsAwarded: 0,
                            referralCode: null
                        })
                        userRoles = ['USER']
                    }
                }

                const sessionStartTime = Date.now()
                startSession({
                    sessionStartTime,
                    userId: telegramUserId,
                    username: username,
                    roles: userRoles
                })

                // Check if referral completion has been checked
                if (!referralCompletionChecked) {
                    await checkReferralCompletion(telegramUserId)
                }
            } catch (e) {
                console.error('Error initializing user session:', e)
                // Set default user in case of error
                useUserStore.setState({
                    userId: null,
                    username: 'Guest',
                    email: '',
                    emailConfirmed: false,
                    roles: ['USER'],
                    totalPoints: 0,
                    points: [],
                    bookmarks: [],
                    authenticated: false,
                    token: null,
                    hasAcademy: false,
                    referralPointsAwarded: 0,
                    referralCode: null
                })
            }
        }

        const fetchData = async () => {
            try {
                await initializeUserSession()

                await Promise.all([
                    fetchAcademiesAndPreloadImages(),
                    fetchUserPoints(),
                    fetchLeaderboards(),
                    fetchVerificationTasks(),
                    fetchGameTasks(),
                    fetchUserVerificationTasks(),
                    fetchCategoriesAndChains()
                ])
            } catch (error) {
                console.error('Error in fetchData:', error)
            }
        }

        fetchData().then(() => {
            // Ensure the intro runs for at least 4 seconds
            setTimeout(() => {
                onComplete()
            }, 4000)
        })
    }, [initData, referralCompletionChecked, checkReferralCompletion]) // Include referralCompletionChecked and checkReferralCompletion in the dependency array

    return (
        <div className="intro-container">
            <div className="intro-image">
                <img src={introImage} alt="Intro Background" className="intro-bg" />
                <img src={coinbeatsText} alt="Coinbeats Text" className="coinbeats-text" />
                <img src={schoolText} alt="School Text" className="school-text" />
            </div>
        </div>
    )
}

export default IntroPage
