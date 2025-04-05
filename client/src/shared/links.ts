import { EarIcon, LeafyGreen, Pointer, ProjectorIcon, Rabbit } from 'lucide-react'

export const ROUTES = {
    // Main routes
    HOME: '/',
    COINS: '/coins',
    LEARN: '/learn',
    RAFFLES: '/raffles',
    EARN: '/earn',
    POINTS: '/points',

    // Nested routes and dynamic routes with params
    getAcademyDetails: (id: number) => `/academy/${id}`
}

export const NAV_ITEMS = [
    {
        label: 'Protocols',
        href: ROUTES.HOME,
        icon: '/graduation-hat.png',
        color: 'text-orange-500'
    },
    {
        label: 'Learn',
        href: ROUTES.LEARN,
        icon: '/discover.png',
        color: 'text-green-500'
    },
    {
        label: 'Raffles',
        href: ROUTES.RAFFLES,
        icon: '/raffles.png',
        color: 'text-green-500'
    },
    {
        label: 'Earn',
        href: ROUTES.EARN,
        icon: '/game-pad.png',
        color: 'text-green-500'
    },
    {
        label: 'Points',
        href: ROUTES.POINTS,
        icon: '/trophy.png',
        color: 'text-green-500'
    }
]
