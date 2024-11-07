import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useUserStore from '../store/useUserStore'
import Spinner from '../components/Spinner'

const TwitterCallback: React.FC = () => {
    const navigate = useNavigate()
    const { setTwitterAuthenticated, setTwitterUserData } = useUserStore()

    useEffect(() => {
        const fetchAccessToken = async () => {
            const urlParams = new URLSearchParams(window.location.search)
            const code = urlParams.get('code')
            const state = urlParams.get('state')

            const storedState = sessionStorage.getItem('twitter_auth_state')
            const codeVerifier = sessionStorage.getItem('twitter_code_verifier')
            const telegramUserId = sessionStorage.getItem('telegram_user_id')

            if (!code || !state || !codeVerifier || !telegramUserId) {
                // Handle error
                navigate('/', { replace: true })
                return
            }

            if (state !== storedState) {
                // Handle state mismatch error
                navigate('/', { replace: true })
                return
            }

            try {
                // Send code and code_verifier to the backend to exchange for tokens
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/twitter/token-exchange`, {
                    code: code,
                    codeVerifier: codeVerifier,
                    telegramUserId: telegramUserId,
                    redirectUri: `${window.location.origin}/twitter-callback`
                })

                // Handle successful authentication
                setTwitterAuthenticated(true)
                setTwitterUserData(response.data.twitterUsername)
                navigate('/', { replace: true })
            } catch (error) {
                // Handle error
                console.error('Error exchanging code for token:', error)
                navigate('/', { replace: true })
            }
        }

        fetchAccessToken()
    }, [navigate, setTwitterAuthenticated, setTwitterUserData])

    return (
        <div className="flex justify-center items-center h-screen">
            <Spinner />
        </div>
    )
}

export default TwitterCallback
