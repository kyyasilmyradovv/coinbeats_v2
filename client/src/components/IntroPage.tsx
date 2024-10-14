// client/src/components/IntroPage.tsx

import React, { useEffect } from 'react'
import './IntroPage.css' // Styles for the intro page
import introImage from '../images/intro.webp'
import coinbeatsText from '../images/coinbeats.png'
import schoolText from '../images/school.png'
import useAcademiesStore from '../store/useAcademiesStore'
import axiosInstance from '../api/axiosInstance'

interface IntroPageProps {
    onComplete: () => void // Function to call when the intro is complete
}

const IntroPage: React.FC<IntroPageProps> = ({ onComplete }) => {
    const setAcademies = useAcademiesStore((state) => state.setAcademies)

    // Function to remove the initial spinner from the index.html
    const removeSpinner = () => {
        const spinner = document.getElementById('initial-spinner')
        if (spinner) {
            spinner.remove() // Remove the spinner from the DOM
        }
    }

    const constructImageUrl = (url: string) => {
        return `https://subscribes.lt/${url}`
    }

    useEffect(() => {
        removeSpinner() // Remove spinner immediately when IntroPage mounts

        const fetchAcademiesAndPreloadImages = async () => {
            try {
                const response = await axiosInstance.get('/api/academies/academies')
                const academiesData = response.data

                // Filter for approved academies
                const approvedAcademies = academiesData.filter((academy: any) => academy.status === 'approved')

                // Store academies data in the global store
                setAcademies(approvedAcademies)

                // Preload images using <link rel="preload">
                const head = document.head || document.getElementsByTagName('head')[0]
                approvedAcademies.forEach((academy: any) => {
                    const link = document.createElement('link')
                    link.rel = 'preload'
                    link.as = 'image'
                    link.href = constructImageUrl(academy.logoUrl)
                    head.appendChild(link)
                })
            } catch (error) {
                console.error('Error fetching academies:', error)
            }
        }

        fetchAcademiesAndPreloadImages()

        const timer = setTimeout(() => {
            onComplete() // Run for at least 4 seconds before transitioning
        }, 4000)

        return () => clearTimeout(timer) // Clean up the timeout when unmounted
    }, [onComplete, setAcademies])

    return (
        <div className="intro-container">
            <div className="intro-image">
                <img src={introImage} alt="Intro Background" className="intro-bg" />
                <img src={coinbeatsText} alt="Coinbeats Text" className="coinbeats-text" />
                <img src={schoolText} alt="School Text" className="school-text" />
            </div>
        </div>
    )
}

export default IntroPage
