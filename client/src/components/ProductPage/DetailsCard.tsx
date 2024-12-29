// client/src/components/ProductPage/DetailsCard.tsx

import React from 'react'
import tickerIcon from '../../images/Ticker.svg'
import categoriesIcon from '../../images/categories 1.png'
import chainsIcon from '../../images/chains.png'
import dexScreenerIcon from '../../images/chains.png'
import contractAddressIcon from '../../images/chains.png'

interface DetailsCardProps {
    academy: any
}

const DetailsCard: React.FC<DetailsCardProps> = ({ academy }) => {
    // Check if the academy is of type "Meme"
    const isMemeAcademy = academy.academyType && academy.academyType.name === 'Meme'

    return (
        <div className="!mb-4 flex justify-around ">
            {/* Content Wrapper with padding */}
            <div className="grid grid-cols-3 gap-4 w-full sm:w-4/6 md:w-3/6 lg:w-4/12	 ">
                {/* Ticker */}
                <div
                    className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200 justify-center "
                    style={{
                        background: '#2E3772',
                        height: '190px',
                        margin: 0,
                        maxWidth: '134px',
                        borderRadius: '8px',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '18px'
                    }}
                >
                    <img src={tickerIcon} className="h-10 w-10 " alt="academy ticker" />
                    <p
                        className="text-black dark:text-gray-200 font-semibold"
                        style={{
                            textAlign: 'center',
                            width: '100px',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {academy.ticker}
                    </p>
                    <div className="text-gray-600 dark:text-gray-400 ">Ticker</div>
                </div>

                {/* Categories */}
                <div
                    className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200  justify-center"
                    style={{
                        background: '#2E3772',
                        height: '190px',
                        margin: 0,
                        maxWidth: '134px',
                        borderRadius: '8px',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '18px'
                    }}
                >
                    <img src={categoriesIcon} className="h-10 w-10 " alt="academy categories" />
                    <p
                        className="text-black dark:text-gray-200 font-semibold"
                        style={{
                            textAlign: 'center',
                            width: '100px',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordBreak: 'break-all'
                        }}
                    >
                        {academy.categories.map((c: any) => c.name).join(', ')}
                    </p>
                    <div className="text-gray-600 dark:text-gray-400">Categories</div>
                </div>

                {/* Chains */}
                <div
                    className="flex items-center mb-2 text-md text-gray-900 dark:text-gray-200 justify-center"
                    style={{
                        background: '#2E3772',
                        height: '190px',
                        margin: 0,
                        maxWidth: '134px',
                        borderRadius: '8px',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '18px'
                    }}
                >
                    <img src={chainsIcon} className="h-10 w-10" alt="academy chains" />
                    <p
                        className="text-black dark:text-gray-200 font-semibold"
                        style={{
                            textAlign: 'center',
                            width: '100px',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {academy.chains.map((c: any) => c.name).join(', ')}
                    </p>
                    <div className="text-gray-600 dark:text-gray-400">Chains</div>
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
        </div>
    )
}

export default DetailsCard
