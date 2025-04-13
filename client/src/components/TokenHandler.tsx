'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'

export default function TokenHandler() {
    const { data: session } = useSession()

    useEffect(() => {
        if ((session as any)?.accessToken && (session as any)?.refreshToken) {
            localStorage.setItem('coinbeatsAT', (session as any).accessToken)
            localStorage.setItem('coinbeatsRT', (session as any).refreshToken)

            signOut()

            console.log('Tokens stored in localStorage.')
        }
    }, [session])

    return null
}
