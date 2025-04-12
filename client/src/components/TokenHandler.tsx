'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'

export default function TokenHandler() {
    const { data: session } = useSession()

    useEffect(() => {
        if (session?.accessToken && session?.refreshToken) {
            localStorage.setItem('coinbeatsAT', session.accessToken)
            localStorage.setItem('coinbeatsRT', session.refreshToken)

            signOut()

            console.log('Tokens stored in localStorage.')
        }
    }, [session])

    return null
}
