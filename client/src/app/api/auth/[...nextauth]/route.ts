import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
    debug: true,
    providers: [
        GoogleProvider({
            clientId: '646655126202-085p616bh21gs8kkmi4o5qimjdrgpcrn.apps.googleusercontent.com',
            clientSecret: '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'
        })
    ],
    callbacks: {
        async signIn({ user }) {
            if (user?.email) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/auth/google-signin`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name
                        })
                    })
                    const data = await response.json()

                    // TODO: Didar sutayda gelen refresh tokeni ve access tokeni store ya sessine nereye kaydetiyorsan etmen lazim burada. username email sheyleri de kaydetmen lazim
                } catch (error) {
                    console.error('Error syncing with backend:', error)
                }
            }

            return true
        }
    },
    pages: {
        error: '/auth/error'
    }
})

export { handler as GET, handler as POST }
