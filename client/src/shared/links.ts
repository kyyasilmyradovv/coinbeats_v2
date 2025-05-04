export const ROUTES = {
    HOME: '/',
    PROTOCOLS: '/protocols',
    COINS: '/coins',
    LEARN: '/discover',
    RAFFLES: '/raffles',
    EARN: '/earn',
    POINTS: '/points',
    EDUCATORS: '/educators',
    AI: '/',

    // Nested routes and dynamic routes with params
    getAcademyDetails: (id: number) => `/academy/${id}`,
    getEducatorDetails: (id: number) => `/educator/${id}`,
    getPodcastDetails: (id: number) => `/podcast/${id}`,
    getChannelDetails: (id: number) => `/channel/${id}`,
    getTutorialDetails: (id: number) => `/tutorial/${id}`,
    getMessages: (id: number | 'new') => `/ai-chat/${id}`
}

export const NAV_ITEMS = [
    {
        label: 'AI Copilot',
        href: ROUTES.HOME,
        color: 'text-primary'
    },
    {
        label: 'Protocols',
        href: ROUTES.PROTOCOLS,
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
