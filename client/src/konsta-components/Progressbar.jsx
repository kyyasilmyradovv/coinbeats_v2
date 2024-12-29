import React from 'react'
import { Icon } from '@iconify/react'

interface ProgressBarProps {
    totalSlides: number
    currentSlideIndex: number
    handlePrevClick: () => void
    handleNextClick: () => void
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalSlides, currentSlideIndex, handlePrevClick, handleNextClick }) => {
    const completedSlides = currentSlideIndex

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div className="w-[100%] md:w-[80%] flex items-center justify-between mb-2 !mx-1 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm p-2 ">
                <div className="p-2 rounded-xl  bg-gray-100 dark:bg-gray-700">
                    <Icon
                        icon="mdi:arrow-left"
                        className={`text-gray-600 dark:text-gray-400 w-6 h-6 cursor-pointer ${currentSlideIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handlePrevClick}
                    />
                </div>
                <div className="relative flex-grow h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{
                            width: `${(completedSlides / totalSlides) * 100}%`,
                            background: 'linear-gradient(to right, #ff0077, #7700ff)'
                        }}
                    />
                </div>
                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700">
                    <Icon
                        icon="mdi:arrow-right"
                        className={`text-gray-600 dark:text-gray-400 w-6 h-6 cursor-pointer ${
                            currentSlideIndex >= totalSlides - 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleNextClick}
                    />
                </div>
            </div>
        </div>
    )
}

export default ProgressBar
