// client/src/components/ProductPage/AcademyInfoCard.tsx

import React from 'react'
import { Card } from 'konsta/react'
import { Icon } from '@iconify/react'

import nameIcon from '../../images/name.png'
import coinsIcon from '../../images/coins-to-earn.png'
import tickerIcon from '../../images/ticker.png'
import categoriesIcon from '../../images/categories.png'
import chainsIcon from '../../images/chains.png'

interface AcademyInfoCardProps {
    academy: any
}

const AcademyInfoCard: React.FC<AcademyInfoCardProps> = ({ academy }) => {
    return (
        <Card className="mb-4 p-0 rounded-2xl shadow-lg m-0 relative border border-gray-300 dark:border-gray-600">
            <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                <img src={nameIcon} className="h-7 w-7 mr-4" alt="academy name" />
                <span className="text-gray-600 dark:text-gray-400 mr-2">Name:</span>
                <span className="text-black dark:text-gray-200 font-semibold truncate">{academy.name}</span>
            </div>
            <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                <img src={coinsIcon} className="h-7 w-7 mr-4" alt="coins to earn" />
                <span className="text-gray-600 dark:text-gray-400 mr-2">Coins to earn:</span>
                <span className="text-black dark:text-gray-200 font-semibold">{academy.xp}</span>
            </div>
            <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                <img src={tickerIcon} className="h-7 w-7 mr-4" alt="academy ticker" />
                <span className="text-gray-600 dark:text-gray-400 mr-2">Ticker:</span>
                <span className="text-black dark:text-gray-200 font-semibold">{academy.ticker}</span>
                {academy.dexScreener && (
                    <a href={academy.dexScreener} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        <Icon icon="mdi:arrow-right-bold" />
                    </a>
                )}
            </div>
            <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                <img src={categoriesIcon} className="h-7 w-7 mr-4" alt="academy categories" />
                <span className="text-gray-600 dark:text-gray-400 mr-2">Categories:</span>
                <span className="text-black dark:text-gray-200 font-semibold truncate">{academy.categories.map((c: any) => c.name).join(', ')}</span>
            </div>
            <div className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200">
                <img src={chainsIcon} className="h-7 w-7 mr-4" alt="academy chains" />
                <span className="text-gray-600 dark:text-gray-400 mr-2">Chains:</span>
                <span className="text-black dark:text-gray-200 font-semibold truncate">{academy.chains.map((c: any) => c.name).join(', ')}</span>
            </div>
        </Card>
    )
}

export default AcademyInfoCard
