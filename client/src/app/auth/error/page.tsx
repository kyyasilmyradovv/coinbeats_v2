'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const errorMessage = () => {
        switch (error) {
            case 'OAuthSignin':
                return 'Error starting Google sign-in. Please try again.'
            case 'OAuthCallback':
                return 'Error during Google authentication. Please try again later.'
            case 'OAuthCreateAccount':
                return 'Unable to create an account using your Google profile.'
            case 'EmailCreateAccount':
                return 'Unable to create an account with this email address.'
            case 'Callback':
                return 'Error during authentication callback. Please try again.'
            default:
                return `An authentication error occurred: ${error || 'Unknown error'}`
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
            <p className="text-center mb-6">{errorMessage()}</p>
            <Link href="/" className="text-blue-500 hover:underline">
                Return to Homepage
            </Link>
        </div>
    )
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    )
}
