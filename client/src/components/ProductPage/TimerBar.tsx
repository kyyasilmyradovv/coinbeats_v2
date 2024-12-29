import React from 'react'
import coinStack from '../../images/coin-stack.svg'

interface TimerBarProps {
    currentQuestion: any // Replace 'any' with your specific type if available
    timer: number
    totalSlides: number
    currentSlideIndex: number
}

const TimerBar: React.FC<TimerBarProps> = ({ currentQuestion, timer, totalSlides, currentSlideIndex }) => {
    // Do not display timer if question is already answered
    // if (currentQuestion && currentQuestion.isCorrect !== undefined) {
    //     return null
    // }

    if (timer === 0) {
        return (
            <div className="text-center mb-2">
                <div className="text-red-600 font-bold">Time is up!</div>
                <div className="text-gray-500 text-sm">You now only get 25% if you answer right.</div>
            </div>
        )
    }

    const totalXP = currentQuestion?.xp || 0
    let displayedPoints = totalXP

    if (timer > 25) {
        displayedPoints = totalXP
    } else if (timer > 0) {
        const basePoints = Math.floor(totalXP * 0.25)
        const remainingPoints = totalXP - basePoints
        const elapsedSeconds = 25 - timer
        const pointsDeducted = Math.floor((remainingPoints / 25) * elapsedSeconds)
        displayedPoints = totalXP - pointsDeducted
    } else {
        displayedPoints = Math.floor(totalXP * 0.25)
    }

    const timePercentage = (timer / 45) * 100

    const getBarColor = () => {
        if (timer > 25) {
            return '#00FF00'
        } else {
            const progress = (25 - timer) / 25
            const hue = 120 - progress * 120
            return `hsl(${hue}, 100%, 50%)`
        }
    }

    return (
        <div className="flex items-center justify-between mb-2 gap-3">
            <div style={{ display: 'flex', gap: '5px', fontWeight: '700', marginLeft: '6px' }}>
                <p style={{ color: '#D52AE9', fontSize: '14px', display: 'flex' }}>Lesson:</p>
                <p style={{ color: '#D52AE9', fontSize: '14px', display: 'flex' }}>
                    {currentSlideIndex + 1}/{totalSlides}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'right', width: '100%', alignItems: 'center' }}>
                <div
                    className="text-gray-900 dark:text-gray-300 text-md font-semibold flex w-8 h-8 items-center justify-center text-center ml-1"
                    style={{ color: '#FFF' }}
                >
                    +{displayedPoints} <img src={coinStack} alt="coin stack" className="w-4 h-4 mr-2 ml-1 " />
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '5px',
                        border: '1px solid #111827',
                        borderRadius: '50px',
                        background: `conic-gradient(#00FF00 ${timePercentage}%, black ${timePercentage}% 100%)`,
                        marginRight: '10px'
                    }}
                >
                    <div
                        className="text-gray-900 dark:text-gray-300 dark:bg-slate-800 text-md font-semibold rounded-full flex w-10 h-10 items-center justify-center text-center"
                        style={{ zIndex: 10000, background: 'black', border: '1px solid #111827' }}
                    >
                        {timer}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TimerBar
