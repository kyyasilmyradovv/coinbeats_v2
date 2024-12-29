// client/src/components/ProductPage/SocialsCard.tsx

import React from 'react'
import { Button } from 'konsta/react'
import gecko from '../../images/coingecko.svg'
import websiteIcon from '../../images/website.svg'
import xIcon from '../../images/X 1.png'
import discordIcon from '../../images/discord 1.svg'
import telegramIcon from '../../images/telegram 1.svg'
interface SocialsCardProps {
    academy: any
}

const SocialsCard: React.FC<SocialsCardProps> = ({ academy }) => {
    return (
        <div className="!mb-4  !rounded-2xl shadow-lg !m-0 relative flex  justify-around">
            <div className="grid grid-cols-4 md:grid-cols-5 gap-4 w-full sm:w-4/6 md:w-3/6 lg:w-4/12">
                {academy.webpageUrl && (
                    <Button
                        clear
                        raised
                        rounded
                        className="w-full dark:text-gray-200 !text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 "
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '80px',
                            borderRadius: '14px',
                            // maxWidth: '100px',
                            padding: '10px',
                            width: '100%'
                        }}
                        onClick={() => window.open(academy.webpageUrl, '_blank')}
                    >
                        <img src={websiteIcon} className="w-7 h-7" alt="academy ticker" />
                        WEBSITE
                    </Button>
                )}
                {academy.twitter && (
                    <Button
                        clear
                        raised
                        rounded
                        className="w-full dark:text-gray-200 !text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 "
                        onClick={() => window.open(academy.twitter, '_blank')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '80px',
                            borderRadius: '14px',
                            maxWidth: '100px',
                            padding: '10px'
                        }}
                    >
                        <img src={xIcon} className="w-7 h-7" alt="academy ticker" />X
                    </Button>
                )}
                {academy.telegram && (
                    <Button
                        clear
                        raised
                        rounded
                        className=" w-full dark:text-gray-200 !text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 "
                        onClick={() => window.open(academy.telegram, '_blank')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '80px',
                            borderRadius: '14px',
                            maxWidth: '100px',
                            padding: '10px'
                        }}
                    >
                        <img src={telegramIcon} className="w-7 h-7" alt="academy ticker" />
                        TELEGRAM
                    </Button>
                )}
                {academy.discord && (
                    <Button
                        clear
                        raised
                        rounded
                        className="w-full dark:text-gray-200 !text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                        onClick={() => window.open(academy.discord, '_blank')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '80px',
                            borderRadius: '14px',
                            maxWidth: '100px',
                            padding: '10px'
                        }}
                    >
                        <img src={discordIcon} className="w-7 h-7" alt="academy ticker" />
                        DISCORD
                    </Button>
                )}
                {academy.coingecko && (
                    <Button
                        clear
                        raised
                        rounded
                        className="w-full dark:text-gray-200 !text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                        onClick={() => window.open(academy.coingecko, '_blank')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '80px',
                            borderRadius: '14px',
                            maxWidth: '100px',
                            padding: '10px'
                        }}
                    >
                        <img src={gecko} className="h-5 w-5" alt="Coingecko logo" />
                        COINGECKO
                    </Button>
                )}
                {/* Updated Trade & Snipe Button */}
            </div>
        </div>
    )
}

export default SocialsCard
