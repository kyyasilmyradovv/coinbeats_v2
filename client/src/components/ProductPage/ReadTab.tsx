// client/src/components/ProductPage/ReadTab.tsx

import React, { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Button } from 'konsta/react'
import ProgressBar from './ProgressBar'
import TimerBar from './TimerBar'
import IntroSlide from './IntroSlide'
import QuizSlide from './QuizSlide'
import InitialQuestionSlide from './InitialQuestionSlide'

interface ReadTabProps {
    initialAnswers: any[]
    currentSlideIndex: number
    handlePrevClick: () => void
    handleNextClick: () => void
    showIntro: boolean
    handleStartQuiz: () => void
    handleBackToProduct: () => void
    quizStarted: boolean
    timer: number
    errorMessage: string
    setErrorMessage: (msg: string) => void
}

const ReadTab: React.FC<ReadTabProps> = ({
    initialAnswers,
    currentSlideIndex,
    handlePrevClick,
    handleNextClick,
    showIntro,
    handleStartQuiz,
    handleBackToProduct,
    quizStarted,
    timer,
    errorMessage,
    setErrorMessage
}) => {
    const swiperRef = useRef<any>(null)

    if (showIntro) {
        return <IntroSlide handleStartQuiz={handleStartQuiz} handleBackToProduct={handleBackToProduct} />
    }

    return (
        <>
            {quizStarted && timer >= 0 && <TimerBar timer={timer} />}
            <ProgressBar
                currentSlideIndex={currentSlideIndex}
                totalSlides={initialAnswers.length * 2}
                handlePrevClick={handlePrevClick}
                handleNextClick={handleNextClick}
            />
            <Swiper pagination={{ clickable: true }} onSlideChange={() => {}} ref={swiperRef} allowTouchMove={true} initialSlide={currentSlideIndex}>
                {initialAnswers.length > 0 ? (
                    initialAnswers.flatMap((_, index) => [
                        <InitialQuestionSlide key={`initial-${index}`} question={initialAnswers[index]} />,
                        <QuizSlide key={`quiz-${index}`} question={initialAnswers[index]} />
                    ])
                ) : (
                    <SwiperSlide key="no-reading-materials">
                        <div className="m-2 p-2">
                            <p className="text-center">No reading materials available</p>
                        </div>
                    </SwiperSlide>
                )}
            </Swiper>
            {errorMessage && <p className="text-red-600 text-center mt-2">{errorMessage}</p>}
        </>
    )
}

export default ReadTab
