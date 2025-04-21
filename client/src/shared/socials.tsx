import { Chrome, Send, X, Youtube } from 'lucide-react'
import Image from 'next/image'

export const SOCIALS = [
    {
        label: 'Web',
        href: '/',
        icon: <Chrome size={30} />,
        hrefKey: 'webpageUrl'
    },
    {
        label: 'Twitter',
        href: '/',
        icon: <X size={30} />,
        hrefKey: 'twitter'
    },
    {
        label: 'Telegram',
        href: '/',
        icon: <Send className="text-blue-500" size={25} />,
        hrefKey: 'telegram'
    },
    {
        label: 'Discord',
        href: '/',
        icon: <Image src={'/discord 1.svg'} alt="discord" height={33} width={33} />,
        hrefKey: 'discord'
    },
    {
        label: 'Coingecko',
        href: '/',
        icon: <Image src={'/coingecko.svg'} alt="discord" height={32} width={32} />,
        hrefKey: 'coingecko'
    },
    {
        label: 'YouTube',
        href: '/',
        icon: <Youtube className="text-red-500" size={30} />,
        hrefKey: 'youtube'
    }
]

export const SOCIALSDISCOVER = [
    {
        label: 'Web',
        href: '/',
        icon: <Chrome size={30} />,
        hrefKey: 'webpageUrl'
    },
    {
        label: 'Twitter',
        href: '/',
        icon: <X size={30} />,
        hrefKey: 'twitterUrl'
    },
    {
        label: 'Telegram',
        href: '/',
        icon: <Send className="text-blue-500" size={25} />,
        hrefKey: 'telegramUrl'
    },
    {
        label: 'Discord',
        href: '/',
        icon: <Image src={'/discord 1.svg'} alt="discord" height={33} width={33} />,
        hrefKey: 'discordUrl'
    },
    {
        label: 'YouTube',
        href: '/',
        icon: <Youtube className="text-red-500" size={30} />,
        hrefKey: 'youtubeUrl'
    },
    {
        label: 'Spotify',
        href: '/',
        icon: <Image src={'/Spotify_icon.svg'} alt="discord" height={33} width={33} />,
        hrefKey: 'SpotifyUrl'
    },
    {
        label: 'substack',
        href: '/',
        icon: <Image src={'/substack-icon.svg'} alt="discord" height={22} width={22} />,
        hrefKey: 'substackUrl'
    }
]
