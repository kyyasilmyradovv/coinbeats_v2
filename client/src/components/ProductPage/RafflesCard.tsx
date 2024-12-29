import React from 'react'
import ticket from '../../images/tickets 1.png'
import moneyBag from '../../images/money.png'
import clock from '../../images/clock 1.png'
import calendar from '../../images/calender 1.svg'
import handTrophy from '../../images/hand-trophy.png'
import RaffleCountdown from '~/components/RaffleCountdownComponent'

interface RafflesCardProps {
    raffle: any
    toggleTooltip: (tooltipIndex: number) => void
    visibleTooltip: number | null
}

const RafflesCard: React.FC<RafflesCardProps> = ({ raffle, toggleTooltip, visibleTooltip }) => {
    return (
        <div className="relative overflow-hidden !rounded-2xl shadow-lg !m-0 tab-background !mb-14">
            <div className="relative z-10  !rounded-2xl tab-content">
                <div
                    className="!rounded-2xl p-4 raffles-content relative"
                    style={{
                        background: '#1C1C1C',
                        borderRadius: '24px'
                    }}
                >
                    {/* Content of the Raffles card */}
                    <div className="text-white relative">
                        {/* Next Raffle */}
                        <div className="mb-2">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <div className="flex items-center !justify-between w-full">
                                    <div className="flex flex-row items-center">
                                        <img src={ticket} className="h-6 w-6 mr-2" alt="Ticket icon" />
                                        <span className="text-md font-semibold">Raffle</span>
                                    </div>
                                    <div className="flex-grow"></div>
                                    <div className="flex flex-row items-center">
                                        <span className="text-sm text-gray-300" style={{ color: '#B57EBC', textDecoration: 'underline' }}>
                                            How to get tickets
                                        </span>
                                        <button
                                            className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-4 h-4 flex items-center justify-center"
                                            style={{
                                                background: '#DE47F0',
                                                color: 'black'
                                            }}
                                            onClick={() => toggleTooltip(0)}
                                        >
                                            ?
                                        </button>
                                        {visibleTooltip === 0 && (
                                            <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-2 mt-2 z-20">
                                                When you complete academy quizzes, you earn raffle tickets for future raffles.
                                                <button className="absolute top-0 right-0 text-white text-sm mt-1 mr-1" onClick={() => toggleTooltip(null)}>
                                                    &times;
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reward Pool */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                    <img src={moneyBag} className="h-5 w-5 mr-2" alt="Money bag icon" />
                                    <span className="text-sm text-gray-300">Reward pool:</span>
                                </div>
                                <div
                                    className="text-sm flex items-center  text-white px-3 py-0 rounded-full shadow-lg"
                                    style={{
                                        background: 'linear-gradient(to right,#1B5A83,#B53FB1)'
                                    }}
                                >
                                    <strong>{raffle.reward}</strong>
                                </div>
                            </div>

                            {/* Winners */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                    <img src={handTrophy} className="h-5 w-5 mr-2" alt="Trophy icon" />
                                    <span className="text-sm text-gray-300">Winners:</span>
                                </div>
                                <div
                                    className="text-sm flex items-center text-white px-3 py-0 rounded-full shadow-lg"
                                    style={{
                                        background: 'linear-gradient(to right,#1B5A83,#B53FB1)'
                                    }}
                                >
                                    <strong>{raffle.winnersCount}</strong>
                                </div>
                            </div>

                            {/* Next Raffle Date */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                    <img src={calendar} className="h-5 w-5 mr-2" alt="Calendar icon" />
                                    <span className="text-sm text-gray-300">Next Raffle:</span>
                                </div>
                                <div
                                    className="flex items-center  text-white px-3 py-0 rounded-full shadow-lg"
                                    style={{
                                        background: 'linear-gradient(to right,#1B5A83,#B53FB1)'
                                    }}
                                >
                                    <span className="text-sm font-bold">
                                        {new Date(raffle?.deadline).toLocaleDateString()} at{' '}
                                        {new Date(raffle.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Time Remaining */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <img src={clock} className="h-5 w-5 mr-2" alt="Clock icon" />
                                    <span className="text-sm text-gray-300">Time remaining:</span>
                                </div>
                                <div
                                    className="flex items-center  text-white px-3 py-0 rounded-full shadow-lg"
                                    style={{
                                        background: 'linear-gradient(to right,#1B5A83,#B53FB1)'
                                    }}
                                >
                                    <span className="text-sm font-bold">{raffle.countdown}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RafflesCard
