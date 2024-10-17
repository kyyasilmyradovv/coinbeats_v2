import React from 'react'
import coinStack from '../../images/coin-stack.png'

interface TimerBarProps {
    currentQuestion: any // Replace 'any' with your specific type if available
    timer: number
}

const TimerBar: React.FC<TimerBarProps> = ({ currentQuestion, timer }) => {
    // Do not display timer if question is already answered
    if (currentQuestion && currentQuestion.isCorrect !== undefined) {
        return null
    }

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
            <div className="text-gray-900 dark:text-gray-300 text-md font-semibold flex w-8 h-8 items-center justify-center text-center ml-1">
                +{displayedPoints} <img src={coinStack} alt="coin stack" className="w-4 h-4 mr-2 ml-2 mb-[4px]" />
            </div>
            <div className="relative flex-grow h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full rounded-full mx-2"
                    style={{
                        width: `${timePercentage}%`,
                        background: getBarColor()
                    }}
                />
            </div>
            <div className="text-gray-900 dark:text-gray-300 dark:bg-slate-800 text-md font-semibold border-2 border-gray-600 rounded-full flex w-8 h-8 items-center justify-center text-center pt-[2px]">
                {timer}
            </div>
        </div>
    )
}

export default TimerBar
