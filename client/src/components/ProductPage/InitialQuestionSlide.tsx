// client/src/components/ProductPage/InitialQuestionSlide.tsx

import React from 'react'
import { SwiperSlide } from 'swiper/react'
import { Card } from 'konsta/react'
import Linkify from 'react-linkify'

interface InitialQuestionSlideProps {
    question: any
}

const InitialQuestionSlide: React.FC<InitialQuestionSlideProps> = ({ question }) => {
    const linkDecorator = (href: string, text: string, key: number) => (
        <a href={href} key={key} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
            {text}
        </a>
    )

    if (question.question === 'Tokenomics details' && question.answer) {
        let parsedAnswer = {}

        try {
            parsedAnswer = JSON.parse(question.answer)
        } catch (error) {
            console.error('Error parsing answer JSON:', error)
        }

        return (
            <SwiperSlide key={`initial-question-${question.academyQuestionId}`}>
                <Card className="my-2 mx-1 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{question.question}</h2>
                    <ul className="list-disc list-inside text-gray-900 dark:text-gray-100">
                        <li>
                            <strong>Total Supply:</strong> {parsedAnswer['totalSupply'] || 'N/A'}
                        </li>
                        <li>
                            <strong>Contract Address:</strong> <Linkify componentDecorator={linkDecorator}>{parsedAnswer['contractAddress'] || 'N/A'}</Linkify>
                        </li>
                        {Object.entries(parsedAnswer).map(([key, value]) => {
                            if (key === 'totalSupply' || key === 'contractAddress') return null
                            return (
                                <li key={key} className="mb-2 break-words">
                                    <strong className="capitalize">{key}:</strong>{' '}
                                    <Linkify componentDecorator={linkDecorator}>{Array.isArray(value) ? value.join(', ') : value}</Linkify>
                                </li>
                            )
                        })}
                    </ul>
                </Card>
            </SwiperSlide>
        )
    }

    return (
        <SwiperSlide key={`initial-question-${question.academyQuestionId}`}>
            <Card className="my-2 mx-1 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mb-12">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{question.question}</h2>
                <p className="text-gray-900 dark:text-gray-100">
                    <Linkify componentDecorator={linkDecorator}>{question.answer || ''}</Linkify>
                </p>
            </Card>
        </SwiperSlide>
    )
}

export default InitialQuestionSlide
