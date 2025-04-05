'use client'

import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function BackTopButton() {
    const [isVisible, setIsVisible] = useState(false)

    // Show button when scroll > 300px
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (!isVisible) return null

    return (
        <Button
            onClick={scrollToTop}
            className="fixed bottom-18 right-6 md:right-18 rounded-full shadow-2xl p-3 animate-float-button cursor-pointer z-50"
            variant="secondary"
        >
            <ArrowUp />
        </Button>
    )
}
