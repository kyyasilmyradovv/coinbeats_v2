// client/src/components/ProductPage/DetailsCard.tsx

import React from 'react'
import { Card } from 'konsta/react'
import { Icon } from '@iconify/react'

// Import icons (ensure you have these icons or replace them with suitable ones)
import nameIcon from '../../images/name.png'
import coinsIcon from '../../images/coins-to-earn.png'
import tickerIcon from '../../images/ticker.png'
import categoriesIcon from '../../images/categories.png'
import chainsIcon from '../../images/chains.png'
import dexScreenerIcon from '../../images/chains.png'
import contractAddressIcon from '../../images/chains.png'

interface DetailsCardProps {
    academy: any // Replace 'any' with your specific type if available
}

const DetailsCard: React.FC<DetailsCardProps> = ({ academy }) => {
    // Check if the academy is of type "Meme"
    const isMemeAcademy = academy.academyType && academy.academyType.name === 'Meme'

    return (
        <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !m-0 relative border border-gray-300 dark:border-gray-600">
            {/* Content Wrapper with padding */}
            <div className="pr-4">
                {/* Name */}
                <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                    <img src={nameIcon} className="h-7 w-7 mr-4" alt="academy name" />
                    <span className="text-gray-600 dark:text-gray-400 mr-2">Name:</span>
                    <span className="text-black dark:text-gray-200 font-semibold break-words">{academy.name}</span>
                </div>

                {/* Coins to Earn */}
                <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                    <img src={coinsIcon} className="h-7 w-7 mr-4" alt="coins to earn" />
                    <span className="text-gray-600 dark:text-gray-400 mr-2">Coins to earn:</span>
                    <span className="text-black dark:text-gray-200 font-semibold">
                        {academy?.fomoNumber > academy?.pointCount ? academy.fomoXp : academy.xp}
                    </span>
                </div>

                {/* Ticker */}
                <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                    <img src={tickerIcon} className="h-7 w-7 mr-4" alt="academy ticker" />
                    <span className="text-gray-600 dark:text-gray-400 mr-2">Ticker:</span>
                    <span className="text-black dark:text-gray-200 font-semibold break-words">{academy.ticker}</span>
                </div>

                {/* Categories */}
                <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                    <img src={categoriesIcon} className="h-7 w-7 mr-4" alt="academy categories" />
                    <span className="text-gray-600 dark:text-gray-400 mr-2">Categories:</span>
                    <span className="text-black dark:text-gray-200 font-semibold break-words">{academy.categories.map((c: any) => c.name).join(', ')}</span>
                </div>

                {/* Chains */}
                <div className="flex items-start mb-2 text-md text-gray-900 dark:text-gray-200">
                    <img src={chainsIcon} className="h-7 w-7 mr-4 mt-1" alt="academy chains" />
                    <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400 mr-2">Chains:</span>
                        <span className="text-black dark:text-gray-200 font-semibold break-words">{academy.chains.map((c: any) => c.name).join(', ')}</span>
                    </div>
                </div>

                {/* Conditionally render dexScreener and contractAddress for Meme academies */}
                {isMemeAcademy && (
                    <>
                        {/* DexScreener */}
                        {academy.dexScreener && (
                            <div className="flex items-start mb-2 text-md text-gray-900 dark:text-gray-200">
                                <img src={dexScreenerIcon} className="h-7 w-7 mr-4 mt-1" alt="DexScreener" />
                                <div className="flex flex-col">
                                    <span className="text-gray-600 dark:text-gray-400 mr-2">DexScreener:</span>
                                    <a href={academy.dexScreener} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">
                                        {academy.dexScreener}
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Contract Address */}
                        {academy.contractAddress && (
                            <div className="flex items-start mb-2 text-md text-gray-900 dark:text-gray-200">
                                <img src={contractAddressIcon} className="h-7 w-7 mr-4 mt-1" alt="Contract Address" />
                                <div className="flex flex-col">
                                    <span className="text-gray-600 dark:text-gray-400 mr-2">Contract Address:</span>
                                    <span className="text-black dark:text-gray-200 font-semibold break-all">{academy.contractAddress}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    )
}

export default DetailsCard
