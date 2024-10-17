// client/src/components/ProductPage/WatchTab.tsx

import React, { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import ProgressBar from './ProgressBar'
import VideoSlide from './VideoSlide'
import QuizSlide from './QuizSlide'

interface WatchTabProps {
    initialAnswers: any[]
    currentSlideIndex: number
    handlePrevClick: () => void
    handleNextClick: () => void
}

const WatchTab: React.FC<WatchTabProps> = ({ initialAnswers, currentSlideIndex, handlePrevClick, handleNextClick }) => {
    const swiperRef = useRef<any>(null)

    return (
        <>
            <ProgressBar
                currentSlideIndex={currentSlideIndex}
                totalSlides={initialAnswers.length * 2}
                handlePrevClick={handlePrevClick}
                handleNextClick={handleNextClick}
            />
            <Swiper pagination={{ clickable: true }} onSlideChange={() => {}} ref={swiperRef} allowTouchMove={true} initialSlide={currentSlideIndex}>
                {initialAnswers.length > 0 ? (
                    initialAnswers.flatMap((question, index) => [
                        <VideoSlide key={`video-${index}`} question={question} />,
                        <QuizSlide key={`quiz-${index}`} question={question} />
                    ])
                ) : (
                    <SwiperSlide key="no-videos">
                        <div className="m-2 p-2">
                            <p className="text-center">No videos available</p>
                        </div>
                    </SwiperSlide>
                )}
            </Swiper>
        </>
    )
}

export default WatchTab
