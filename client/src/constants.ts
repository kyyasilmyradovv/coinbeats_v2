// src/constants.ts

// Import images
import coinStack from './images/coin-stack.png'
import bunnyLogo from './images/bunny-head.png'
import bunnyImage from './images/bunny-head.png'
import comingSoon from './images/svgs/coming-soon3.svg'
import ticket from './images/ticket.png'
import calendar from './images/calendar.png'
import moneyBag from './images/money-bag.png'
import handTrophy from './images/hand-trophy.png'
import clock from './images/clock.png'
import wallet from './images/wallet.png'
import nameIcon from './images/name.png'
import coinsIcon from './images/coins-to-earn.png'
import tickerIcon from './images/ticker.png'
import categoriesIcon from './images/categories.png'
import chainsIcon from './images/chains.png'
import geckoLogo from './images/coingecko.svg'

// Raffles data used in RafflesCard component
export const raffles = [
    {
        date: new Date('2024-10-12T14:00:00'),
        reward: '200 USDC',
        winners: '10 x 20 USDC'
    },
    {
        date: new Date('2024-10-20T14:00:00'),
        reward: '200 USDC',
        winners: '10 x 20 USDC'
    },
    {
        date: new Date('2024-10-28T14:00:00'),
        reward: '200 USDC',
        winners: '10 x 20 USDC'
    }
]

// Export image paths for consistent usage
export const imageAssets = {
    coinStack,
    bunnyLogo,
    bunnyImage,
    comingSoon,
    ticket,
    calendar,
    moneyBag,
    handTrophy,
    clock,
    wallet,
    nameIcon,
    coinsIcon,
    tickerIcon,
    categoriesIcon,
    chainsIcon,
    geckoLogo
}
