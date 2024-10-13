// client/src/components/IntroPage.tsx

import React, { useEffect } from 'react'
import './IntroPage.css' // Styles for the intro page
import introImage from '../images/intro.webp'
import coinbeatsText from '../images/coinbeats.png'
import schoolText from '../images/school.png'
import useAcademiesStore from '../store/useAcademiesStore'

interface IntroPageProps {
    onComplete: () => void // Function to call when the intro is complete
}

const IntroPage: React.FC<IntroPageProps> = ({ onComplete }) => {
    const fetchAcademies = useAcademiesStore((state) => state.fetchAcademies)

    // Function to remove the initial spinner from the index.html
    const removeSpinner = () => {
        const spinner = document.getElementById('initial-spinner')
        if (spinner) {
            spinner.remove() // Remove the spinner from the DOM
        }
    }

    useEffect(() => {
        removeSpinner() // Remove spinner immediately when IntroPage mounts
        fetchAcademies() // Start fetching data for the academies

        const timer = setTimeout(() => {
            onComplete() // Run for at least 2 seconds before transitioning
        }, 4000)

        return () => clearTimeout(timer) // Clean up the timeout when unmounted
    }, [onComplete, fetchAcademies])

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
