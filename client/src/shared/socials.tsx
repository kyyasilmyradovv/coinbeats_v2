import { Chrome, Send, Twitter } from 'lucide-react'
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
        icon: <Twitter size={30} />,
        hrefKey: 'twitter'
    },
    {
        label: 'Telegram',
        href: '/',
        icon: <Send className="text-blue-500" size={30} />,
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
    }
]
