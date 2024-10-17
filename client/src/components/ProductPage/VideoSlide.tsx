// client/src/components/ProductPage/VideoSlide.tsx

import React from 'react'
import { SwiperSlide } from 'swiper/react'
import { Card } from 'konsta/react'
import { extractYouTubeVideoId } from '../../utils/extractYouTubeVideoId'

interface VideoSlideProps {
    question: any
    questionIndex: number
}

const VideoSlide: React.FC<VideoSlideProps> = ({ question, questionIndex }) => {
    if (!question) return null

    const videoUrl = question.video
    const videoId = extractYouTubeVideoId(videoUrl || '')
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : ''

    return (
        <SwiperSlide key={`video-slide-${questionIndex}`}>
            <Card className="my-2 mx-1 p-2 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                {embedUrl ? (
                    <iframe
                        width="100%"
                        height="315"
                        src={embedUrl}
                        title={`Video ${questionIndex + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <p className="text-center text-red-500">Invalid video URL</p>
                )}
            </Card>
        </SwiperSlide>
    )
}

export default VideoSlide
