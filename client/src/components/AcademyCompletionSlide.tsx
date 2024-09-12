import React, { useEffect, useState } from 'react'
import { Button, Card } from 'konsta/react'
import coinStack from '../images/coin-stack.png'
import { useNavigate } from 'react-router-dom'
import ximage from '../images/x.png'
import axiosInstance from '../api/axiosInstance'
import useUserStore from '~/store/useUserStore'

type AcademyCompletionSlideProps = {
    earnedPoints: number
    totalPoints: number
    academyName: string // Add the academy name as a prop
}

const AcademyCompletionSlide: React.FC<AcademyCompletionSlideProps> = ({ earnedPoints, totalPoints, academyName }) => {
    const navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(false) // Handle Twitter auth state
    const [accessToken, setAccessToken] = useState<string | null>(null) // Store the Twitter access token
    const { userId } = useUserStore((state) => ({
        userId: state.userId
    }))

    // Prefilled tweet content
    const tweetContent = `I just completed ${academyName} academy on CoinBeats Crypto School! 🎉🚀 #CoinBeats #CryptoSchool`

    // Step 1: Trigger Twitter OAuth flow using axiosInstance
    const handleTwitterLogin = async () => {
        try {
            const response = await axiosInstance.get('/api/verification/twitter/login')
            const { authorizationUrl } = response.data
            window.location.href = authorizationUrl // Redirect to Twitter OAuth authorization URL
        } catch (error) {
            console.error('Twitter login failed:', error)
        }
    }

    // Step 2: Check for access token in the URL after Twitter authentication
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('access_token')
        if (token) {
            setAccessToken(token)
            setIsAuthenticated(true)
            console.log('Twitter OAuth successful. Access token received:', token)
        }
    }, [])

    // Step 3: Post tweet content
    const handleTweetClick = () => {
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`
        window.open(tweetUrl, '_blank') // Open the tweet window in a new tab
    }

    // Step 4: Verify if the tweet matches the task requirement
    const handleTweetVerify = async () => {
        try {
            if (!accessToken) {
                alert('Please login to Twitter first.')
                return
            }

            // Assume the user posts the tweet and we fetch the latest tweet ID from their timeline
            const response = await axiosInstance.get('/api/verification/twitter/fetch-latest-tweet', {
                headers: {
                    Authorization: `Bearer ${accessToken}` // Use the token received from OAuth
                }
            })

            const tweetId = response.data.tweetId // Assuming backend returns the latest tweet ID
            console.log('Tweet ID:', tweetId)

            const verifyResponse = await axiosInstance.post('/api/verification/verify-twitter', {
                userId: userId,
                tweetId: tweetId,
                taskId: 1 // Task ID for verification
            })

            if (verifyResponse.data.points) {
                alert(`Verification successful! You earned ${verifyResponse.data.points} points.`)
            }
        } catch (error) {
            console.error('Verification failed:', error)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full mb-12">
            <h2 className="text-xl font-bold mb-4">In total you collected:</h2>
            <div className="flex items-center justify-center text-4xl font-bold mb-8">
                {earnedPoints} / {totalPoints} <img src={coinStack} alt="coin stack" className="w-12 h-12 ml-2 mb-2" />
            </div>
            <Button
                large
                rounded
                outline
                disabled
                className="mb-4"
                style={{
                    backgroundColor: 'gray',
                    color: '#fff'
                }}
            >
                Earn by doing quests
            </Button>
            <Button
                large
                rounded
                outline
                onClick={() => navigate('/')}
                style={{
                    background: 'linear-gradient(to left, #ff0077, #7700ff)',
                    color: '#fff'
                }}
            >
                Explore more academies
            </Button>

            <Card className="!my-6 !mx-0 !p-1 !rounded-2xl border border-gray-400 dark:border-gray-700 shadow-lg flex items-center justify-between">
                {/* Left Side: Celebration Emoji and Text */}
                <div className="flex items-start">
                    <div className="w-[96px] h-[48px] bg-gray-300 mr-4 items-center justify-center text-center rounded-md pl-[1px]">
                        <img src={ximage} alt="coin stack" className="w-[90px] h-[50px]" />
                    </div>
                    <div>
                        <div className="flex items-center">
                            <p className="text-[16px] font-bold dark:text-gray-100 mb-2">Post to X +50</p>{' '}
                            <img src={coinStack} alt="coin stack" className="w-6 h-6 ml-2 mb-2" />
                        </div>
                        <p className="text-md dark:text-gray-100 mb-2">🎉 I just completed {academyName} academy on CoinBeats Crypto School</p>
                    </div>
                </div>
                <div className="flex">
                    <Button rounded solid outline onClick={handleTwitterLogin} className="flex items-center py-2 mx-2 rounded-xl shadow-sm">
                        Post on X
                    </Button>
                    <Button rounded onClick={handleTweetVerify} className="flex items-center py-2 mx-2 rounded-xl shadow-sm">
                        Verify
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default AcademyCompletionSlide
