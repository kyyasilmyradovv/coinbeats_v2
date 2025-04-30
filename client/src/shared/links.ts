export const ROUTES = {
    // Main routes
    HOME: '/',
    COINS: '/coins',
    LEARN: '/discover',
    RAFFLES: '/raffles',
    EARN: '/earn',
    POINTS: '/points',
    EDUCATORS: '/educators',
    AI: '/ai-chat',

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
        label: 'Protocols',
        href: ROUTES.HOME,
        icon: '/graduation-hat.png',
        color: 'text-orange-500'
        // iconComponent: <GraduationCap className={`w-6 h-6 text-foreground `} />
    },
    {
        label: 'Learn',
        href: ROUTES.LEARN,
        icon: '/discover.png',
        color: 'text-green-500'
        // iconComponent: <Compass className={`w-6 h-6 text-foreground `} />
    },
    {
        label: 'Raffles',
        href: ROUTES.RAFFLES,
        icon: '/raffles.png',
        color: 'text-green-500'
        // iconComponent: <Gift className={`w-6 h-6 text-foreground `} />
    },
    {
        label: 'Earn',
        href: ROUTES.EARN,
        icon: '/game-pad.png',
        color: 'text-green-500'
        // iconComponent: <Star className={`w-6 h-6 text-foreground `} />
    },
    {
        label: 'Points',
        href: ROUTES.POINTS,
        icon: '/trophy.png',
        color: 'text-green-500'
        // iconComponent: <Award className={`w-6 h-6 text-foreground `} />
    }
]
