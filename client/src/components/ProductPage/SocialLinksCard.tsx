// client/src/components/ProductPage/SocialLinksCard.tsx

import React from 'react'
import { Card, Button } from 'konsta/react'
import { Icon } from '@iconify/react'
import { X } from '@mui/icons-material'

import geckoLogo from '../../images/coingecko.svg'

interface SocialLinksCardProps {
    academy: any
}

const SocialLinksCard: React.FC<SocialLinksCardProps> = ({ academy }) => {
    return (
        <Card className="mb-4 p-0 rounded-2xl shadow-lg m-0 relative border border-gray-300 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-4 w-full">
                {academy.webpageUrl && (
                    <Button
                        clear
                        raised
                        rounded
                        className="flex items-center justify-start gap-2 w-full dark:text-gray-200 text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                        onClick={() => window.open(academy.webpageUrl, '_blank')}
                    >
                        <Icon icon="mdi:web" color="#6c757d" className="w-5 h-5" />
                        WEBSITE
                    </Button>
                )}
                {academy.twitter && (
                    <Button
                        clear
                        raised
                        rounded
                        className="flex items-center justify-start gap-2 w-full dark:text-gray-200 text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                        onClick={() => window.open(academy.twitter, '_blank')}
                    >
                        <X className="w-6 h-6 text-blue-500 p-1 m-0" />X
                    </Button>
                )}
                {academy.telegram && (
                    <Button
                        clear
                        raised
                        rounded
                        className="flex items-center justify-start gap-2 w-full dark:text-gray-200 text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                        onClick={() => window.open(academy.telegram, '_blank')}
                    >
                        <Icon icon="mdi:telegram" color="#0088cc" className="w-5 h-5" />
                        TELEGRAM
                    </Button>
                )}
                {academy.discord && (
                    <Button
                        clear
                        raised
                        rounded
                        className="flex items-center justify-start gap-2 w-full dark:text-gray-200 text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                        onClick={() => window.open(academy.discord, '_blank')}
                    >
                        <Icon icon="mdi:discord" color="#7289DA" className="w-5 h-5" />
                        DISCORD
                    </Button>
                )}
                {academy.coingecko && (
                    <Button
                        clear
                        raised
                        rounded
                        className="flex items-center justify-start gap-2 w-full dark:text-gray-200 text-xs bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full"
                        onClick={() => window.open(academy.coingecko, '_blank')}
                    >
                        <img src={geckoLogo} className="h-5 w-5" alt="Coingecko logo" />
                        COINGECKO
                    </Button>
                )}
            </div>
        </Card>
    )
}

export default SocialLinksCard
