// client/src/hooks/useTimer.ts

import { useState, useEffect, useRef } from 'react'

interface UseTimerProps {
    initialTime: number
    onTimeUp?: () => void
}

export const useTimer = ({ initialTime, onTimeUp }: UseTimerProps) => {
    const [timer, setTimer] = useState(initialTime)
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        startTimer()
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const startTimer = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current)
        }
        timerIntervalRef.current = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(timerIntervalRef.current!)
                    if (onTimeUp) onTimeUp()
                    return 0
                }
                return prevTimer - 1
            })
        }, 1000)
    }

    const resetTimer = (newTime: number) => {
        setTimer(newTime)
        startTimer()
    }

    return {
        timer,
        resetTimer,
        startTimer
    }
}
