import React, { useState, useEffect } from 'react'

interface TypewriterProps {
    text: string
    speed?: number
    className?: string
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 20, className = '' }) => {
    const [displayedText, setDisplayedText] = useState('')

    useEffect(() => {
        let index = 0
        let timerId: ReturnType<typeof setTimeout>
        setDisplayedText('')

        const tick = () => {
            setDisplayedText(text.slice(0, index + 1))
            index++
            if (index < text.length) {
                timerId = setTimeout(tick, speed)
            }
        }
        tick()

        return () => clearTimeout(timerId)
    }, [text, speed])

    return <span className={className}>{displayedText}</span>
}

export default Typewriter
