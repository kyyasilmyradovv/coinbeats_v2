import React from 'react'
import coming from '../../images/svgs/coming-soon3.svg'
import wallet from '../../images/wallet.png'
import ticket from '../../images/ticket.png'
import moneyBag from '../../images/money-bag.png'
import clock from '../../images/clock.png'
import calendar from '../../images/calendar.png'
import handTrophy from '../../images/hand-trophy.png'

interface RafflesCardProps {
    raffles: any[]
    timeRemainingList: string[]
    toggleTooltip: (tooltipIndex: number) => void
    visibleTooltip: number | null
}

const RafflesCard: React.FC<RafflesCardProps> = ({ raffles, timeRemainingList, toggleTooltip, visibleTooltip }) => {
    return (
        <div className="relative overflow-hidden !rounded-2xl shadow-lg !m-0 tab-background !mb-4">
            <div className="relative z-10 m-[2px] !rounded-2xl tab-content">
                <div
                    className="!rounded-2xl p-4 raffles-content relative"
                    style={{
                        backgroundImage: `url(${wallet})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '35%', // Adjusted to 1/3 size
                        backgroundPosition: 'right bottom'
                    }}
                >
                    {/* Content of the Raffles card */}
                    <div className="text-white relative">
                        {/* Next Raffle */}
                        <div className="mb-2">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <div className="flex items-center !justify-between w-full">
                                    <div className="flex flex-row items-center">
                                        <img src={ticket} className="h-8 w-8 mr-2" alt="Ticket icon" />
                                        <span className="text-md font-semibold">Raffle</span>
                                    </div>
                                    <div className="flex-grow"></div>
                                    <div className="flex flex-row items-center">
                                        <span className="text-sm text-gray-300">How to get tickets</span>
                                        <button
                                            className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-4 h-4 flex items-center justify-center"
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

                            {/* Next Raffle Date */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                    <img src={calendar} className="h-5 w-5 mr-2" alt="Calendar icon" />
                                    <span className="text-sm text-gray-300">Next Raffle:</span>
                                </div>
                                <div className="flex items-center bg-gradient-to-r from-green-700 to-blue-800 text-white px-3 py-0 rounded-full shadow-lg">
                                    <span className="text-sm font-bold">
                                        {raffles[0].date.toLocaleDateString()} at{' '}
                                        {raffles[0].date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Reward Pool */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                    <img src={moneyBag} className="h-5 w-5 mr-2" alt="Money bag icon" />
                                    <span className="text-sm text-gray-300">Reward pool:</span>
                                </div>
                                <div className="text-sm flex items-center bg-gradient-to-r from-green-700 to-blue-800 text-white px-3 py-0 rounded-full shadow-lg">
                                    <strong>{raffles[0].reward}</strong>
                                </div>
                            </div>

                            {/* Winners */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                    <img src={handTrophy} className="h-5 w-5 mr-2" alt="Trophy icon" />
                                    <span className="text-sm text-gray-300">Winners:</span>
                                </div>
                                <div className="text-sm flex items-center bg-gradient-to-r from-green-700 to-blue-800 text-white px-3 py-0 rounded-full shadow-lg">
                                    <strong>{raffles[0].winners}</strong>
                                </div>
                            </div>

                            {/* Time Remaining */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <img src={clock} className="h-5 w-5 mr-2" alt="Clock icon" />
                                    <span className="text-sm text-gray-300">Time remaining:</span>
                                </div>
                                <div className="flex items-center bg-gradient-to-r from-green-700 to-blue-800 text-white px-3 py-0 rounded-full shadow-lg">
                                    <span className="text-sm font-bold">{timeRemainingList[0]}</span>
                                </div>
                            </div>
                        </div>

                        {/* Future Raffles */}
                        <div className="mt-6">
                            <div className="flex flex-row items-center mb-4">
                                <img src={ticket} className="h-8 w-8 mr-2" alt="Ticket icon" />
                                <span className="text-md font-semibold">Future Raffles</span>
                            </div>
                            {raffles.slice(1).map((raffle, index) => (
                                <div key={index} className="mb-2 flex flex-row items-center">
                                    <img src={calendar} className="h-5 w-5 mr-2" alt="Calendar icon" />
                                    <p className="text-sm text-gray-300">
                                        {raffle.date.toLocaleDateString()} at {raffle.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 bottom-12">
                    <img src={coming} className="h-16 w-full -rotate-[35deg]" alt="coming icon" />
                </div>
            </div>
        </div>
    )
}

export default RafflesCard
