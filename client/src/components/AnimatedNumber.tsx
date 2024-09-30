// src/components/AnimatedNumber.js

import { useState, useEffect } from 'react'

interface AnimatedNumberProps {
    target: number
    duration: number
    onComplete?: () => void
}

function AnimatedNumber({ target, duration, onComplete }: AnimatedNumberProps) {
    const [number, setNumber] = useState(0)

    useEffect(() => {
        let start = 0
        const increment = target / (duration / 50)

        const interval = setInterval(() => {
            start += increment
            if (start >= target) {
                start = target
                clearInterval(interval)
                if (onComplete) {
                    onComplete()
                }
            }
            setNumber(Math.floor(start))
        }, 50)

        return () => clearInterval(interval)
    }, [target, duration, onComplete])

    return <div>{number}</div>
}

export default AnimatedNumber
