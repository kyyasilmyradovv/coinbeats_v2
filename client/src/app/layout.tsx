import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { ThemeProvider } from '@/components/theme toggle/theme-provider'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import './animations.css'
import { Footer } from '@/components/footer'
import { StoreProvider } from '@/providers/storeProvider'
import BackTopButton from '@/components/backToTop'
import { LoginModal } from '@/components/loginModal'
import { SignUpModal } from '@/components/signUpModal'
import Providers from '@/components/Providers'
import TokenHandler from '@/components/TokenHandler'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Coinbeats',
    description: 'Coinbeats App',
    icons: {
        icon: '/favicon.svg'
    }
}

export default function RootLayout({ children, session }: { children: React.ReactNode; session: any }) {
    return (
        <StoreProvider>
            <html lang="en">
                <body className={`${inter.className} antialiased relative min-h-[100vh]`}>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                        <Toaster />
                        <Header />
                        <Providers session={session}>
                            <TokenHandler />
                            <main className="flex-1 ">
                                {children}
                                <BackTopButton />
                                <LoginModal />
                                <SignUpModal />
                            </main>
                        </Providers>
                        {/* <footer className="pt-0 pb-20">
                            <div className="px-2 text-center text-sm text-muted-foreground">© 2025 coinbeats All rights reserved.</div>
                        </footer> */}
                        <Footer />
                    </ThemeProvider>
                </body>
            </html>
        </StoreProvider>
    )
}
