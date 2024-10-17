// client/src/components/ProductPage/QuizSlide.tsx

import React from 'react'
import { SwiperSlide } from 'swiper/react'
import { Card, Button, Radio } from 'konsta/react'

interface QuizSlideProps {
    question: any
    questionIndex: number
    handleChoiceClick: (questionIndex: number, choiceIndex: number) => void
    handleCheckAnswer: (questionIndex: number) => void
    handleNextQuestion: () => void
    errorMessage: string
    totalQuestions: number
}

const QuizSlide: React.FC<QuizSlideProps> = ({
    question,
    questionIndex,
    handleChoiceClick,
    handleCheckAnswer,
    handleNextQuestion,
    errorMessage,
    totalQuestions
}) => {
    return (
        <SwiperSlide key={`quiz-question-${questionIndex}-${question.isCorrect}`}>
            <Card className="mx-1 my-2 p-2 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{question.quizQuestion}</p>
            </Card>
            <Card className="my-4 mx-1 p-2 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                {question.choices.map((choice: any, choiceIndex: number) => (
                    <div
                        key={choiceIndex}
                        className={`cursor-pointer p-4 rounded-lg flex justify-between items-center dark:bg-gray-700 dark:text-gray-200 ${
                            question.isCorrect === undefined && question.selectedChoice === choiceIndex ? 'bg-purple-200 border border-purple-500' : ''
                        } ${
                            question.isCorrect !== undefined
                                ? choice.isCorrect
                                    ? 'bg-green-200 border border-green-500'
                                    : choiceIndex === question.selectedChoice
                                      ? 'bg-red-200 border border-red-500'
                                      : ''
                                : ''
                        } mb-2`}
                        onClick={() => handleChoiceClick(questionIndex, choiceIndex)}
                        style={{ pointerEvents: question.isCorrect !== undefined ? 'none' : 'auto' }}
                    >
                        <span className="mr-4">{choice.text}</span>
                        <Radio checked={question.selectedChoice === choiceIndex} readOnly />
                    </div>
                ))}
            </Card>
            {errorMessage && <p className="text-red-600 text-center mb-4">{errorMessage}</p>}
            <div>
                <Button
                    large
                    rounded
                    outline
                    onClick={() => {
                        if (question.isCorrect !== undefined) {
                            handleNextQuestion()
                        } else {
                            handleCheckAnswer(questionIndex)
                        }
                    }}
                    className="mt-4 mb-12"
                    style={{
                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                        color: '#fff'
                    }}
                >
                    {question.isCorrect !== undefined ? (questionIndex === totalQuestions - 1 ? 'Complete academy' : 'Next question') : 'Check Answer'}
                </Button>
            </div>
        </SwiperSlide>
    )
}

export default QuizSlide
