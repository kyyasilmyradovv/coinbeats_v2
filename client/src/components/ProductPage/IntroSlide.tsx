import React from 'react'
import { Card, Button } from 'konsta/react'

interface IntroSlideProps {
    handleBackToProduct: () => void
    handleStartQuiz: () => void
}

const IntroSlide: React.FC<IntroSlideProps> = ({ handleBackToProduct, handleStartQuiz }) => {
    return (
        <div className="p-1 mt-4">
            <Card className="!m-0 !p-2 text-center !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                <p>
                    You have <span className="text-white text-lg font-bold">25</span> ⏳ seconds to read the content and answer. After that, the points start to
                    gradually decrease over the next <span className="text-white text-lg font-bold">20</span> seconds! If the bar runs out of time, then you
                    will be rewarded only 25% of the total possible points. <br />
                    <br />
                    <span className="text-lg font-semibold">Are you ready?</span>
                </p>
                <div className="flex justify-center mt-4 gap-4">
                    <Button outline rounded onClick={handleBackToProduct} className="!text-xs">
                        No, go back
                    </Button>
                    <Button
                        outline
                        rounded
                        onClick={handleStartQuiz}
                        style={{
                            background: 'linear-gradient(to left, #ff0077, #7700ff)',
                            color: '#fff'
                        }}
                    >
                        START
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default IntroSlide
