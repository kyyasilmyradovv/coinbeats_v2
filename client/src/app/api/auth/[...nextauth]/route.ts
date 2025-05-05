import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
    debug: false,
    secret: 'DQOD+Er5D9C5UTFjPORA6YhV3Bo2zkZs1Tw/NPt4Fno=',
    useSecureCookies: true,
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
                domain: '.coinbeats.xyz'
            }
        }
    },
    providers: [
        GoogleProvider({
            clientId: '646655126202-085p616bh21gs8kkmi4o5qimjdrgpcrn.apps.googleusercontent.com',
            clientSecret: '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',
            authorization: {
                params: {
                    redirect_uri: 'https://coinbeats.xyz/api/auth/callback/google',
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code'
                }
            },
            httpOptions: {
                timeout: 20000
            }
        })
    ],
    callbacks: {
        async signIn({ user }: { user: any }) {
            if (user?.email) {
                try {
                    const response = await fetch(`https://coinbeats.xyz/api/v2/user/auth/google-signin`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name
                        }),
                        // Add timeout for this fetch as well
                        signal: AbortSignal.timeout(8000)
                    })
                    const data = await response.json()

                    if (!data?.accessToken || !data?.refreshToken) {
                        console.error('No tokens received from backend.')
                        return false
                    }
                    // Attach tokens to user object
                    user.accessToken = data.accessToken
                    user.refreshToken = data.refreshToken
                } catch (error) {
                    console.error('Error syncing with backend:', error)
                    return false
                }
            }
            return true
        },
        async jwt({ token, account, user }) {
            if (account && user) {
                token.accessToken = (user as any).accessToken
                token.refreshToken = (user as any).refreshToken
            }
            return token
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.accessToken = token.accessToken
                session.refreshToken = token.refreshToken
            }
            return session
        }
    },
    pages: {
        error: '/auth/error'
    }
})

export { handler as GET, handler as POST }
