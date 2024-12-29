import React from 'react'
import Lottie from 'react-lottie'
import coinsEarnedAnimationData from '../../animations/earned-coins.json'

interface PointsCollectedCardProps {
    earnedPoints: number
    totalPoints: number
    hasRaffle: boolean
}

const PointsCollectedCard: React.FC<PointsCollectedCardProps> = ({ earnedPoints, totalPoints, hasRaffle }) => {
    const coinsEarnedAnimation = {
        loop: true,
        autoplay: true,
        animationData: coinsEarnedAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    return (
        <div
            className={`!mb-${hasRaffle ? '4' : '14'} !p-2 bg-white dark:bg-zinc-900 !m-0 !rounded-2xl shadow-lg relative border border-gray-300 dark:border-gray-600`}
        >
            <div className="flex flex-row text-gray-900 dark:text-gray-200 items-center justify-between">
                <div className=" block md:flex ">
                    <div className="text-md text-gray-600 dark:text-gray-400 mr-2">Earned Coins:</div>
                    <div className="text-md text-black dark:text-gray-200 font-semibold">
                        {earnedPoints}/{totalPoints}
                    </div>
                </div>
                <div className="w-13 h-13 mr-2 items-center">
                    <Lottie options={coinsEarnedAnimation} height={50} width={50} />
                </div>
            </div>
        </div>
    )
}

export default PointsCollectedCard
