import React, { useEffect, useState } from 'react'

interface Raffle {
    countdown: string
}

interface RaffleCountdownProps {
    raffle: Raffle
}

const RaffleCountdown: React.FC<RaffleCountdownProps> = ({ raffle }) => {
    const [animation, setAnimation] = useState<boolean>(false)

    useEffect(() => {
        setAnimation(true)
        const timer = setTimeout(() => setAnimation(false), 500) // Matches animation duration
        return () => clearTimeout(timer)
    }, [raffle.countdown])

    return (
        <>
            <style>
                {`
          @keyframes subtleShake {
            0% {
              transform: scale(1) rotate(0deg);
              color: #a855f7; /* Purple */
              text-shadow: 0px 0px 5px #a855f7;
              opacity: 1;
            }
            25% {
              transform: scale(1.05) rotate(2deg);
              color: #f97316; /* Orange */
              text-shadow: 0px 0px 8px #f97316;
            }
            50% {
              transform: scale(1.1) rotate(-2deg);
              color: #34d399; /* Green */
              text-shadow: 0px 0px 10px #34d399;
              opacity: 0.9;
            }
            75% {
              transform: scale(1.05) rotate(1deg);
              color: #3b82f6; /* Blue */
              text-shadow: 0px 0px 8px #3b82f6;
            }
            100% {
              transform: scale(1) rotate(0deg);
              color: #a855f7; /* Purple */
              text-shadow: 0px 0px 5px #a855f7;
              opacity: 1;
            }
          }
          .animate-subtle-shake {
            animation: subtleShake 0.5s ease-in-out;
          }
        `}
            </style>
            <div className={`mt-1 text-xs ${animation ? 'animate-subtle-shake' : ''}`}>{raffle.countdown}</div>
        </>
    )
}

export default RaffleCountdown
