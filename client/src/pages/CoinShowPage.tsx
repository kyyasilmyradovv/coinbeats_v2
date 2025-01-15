import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from '~/api/axiosInstance'
import { Page, Button, Preloader, Card } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Tabs from '../components/common/Tabs'
import { IconCaretDownFilled, IconCaretUpFilled, IconAlertCircle, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import CoinPriceChart from '~/components/Chart'

interface CoinProps {
    id: number
    name: string
    symbol: string
    price: number
    price_change_1h: number
    price_change_24h: number
    price_change_7d: number
    price_change_14d: number
    price_change_30d: number
    price_change_1y: number
    ath: number
    ath_date: string
    atl: number | null
    atl_date: string | null
    market_cap: number
    market_cap_rank: number
    categories: string[]
    image: string
    homepage_links: string[]
    contract_addresses: string[]
    twitter_screen_name: string
    listed_date: string
    fdv: number
}

const CoinShowPage: React.FC = () => {
    const detailsCardRef = useRef<HTMLDivElement | null>(null)
    const { id } = useParams<{ id: string }>()
    const [coin, setCoin] = useState<CoinProps | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [activeTab, setActiveTab] = useState('Hour')
    const [tooltip, setTooltip] = useState('')
    const [dropdown, setDropdown] = useState('')
    const [expandCategories, setExpandCategories] = useState(false)
    const [expandAddresses, setExpandAddresses] = useState(false)
    const [expandHomepages, setExpandHomepages] = useState(false)

    const [priceData, setPriceData] = useState([
        { time: '2PM', price: 8345 },
        { time: '1PM', price: 8004.23 },
        { time: '12PM', price: 7900.75 },
        { time: '11AM', price: 8000 },
        { time: '10AM', price: 8123.45 }
    ])

    const tabs = ['Hour', 'Day', 'Week', 'Month', 'Year']

    const fetchCoinShowPage = async () => {
        try {
            const response = await axiosInstance.get(`/api/coins/${id}`)
            setCoin(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching coin:', error)
        }
    }

    useEffect(() => {
        fetchCoinShowPage()
    }, [id])

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setPriceData([
            { time: 'Jan 14', price: 5323 },
            { time: 'Jan 13', price: 1242 },
            { time: 'Jan 12', price: 1256 },
            { time: 'Jan 11', price: 2345 },
            { time: 'Jan 10', price: 23545 }
        ])
    }

    function cutNumbers(value: number, length = 5, isPrice: boolean = false): string {
        let newValue = value.toString()
        let [integerPart, decimalPart] = newValue.split('.')

        // Add commas to the integer part
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

        newValue = decimalPart ? `${integerPart}.${decimalPart}` : integerPart
        newValue = newValue.slice(0, length + (newValue.includes('.') ? 1 : 0))

        return newValue
    }

    function formatNumber(value: number): string {
        return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || ''
    }

    function formatPrice(number: any): string {
        if (number == null) return 'N/A'

        if (number >= 1_000_000_000) {
            return '$' + (number / 1_000_000_000).toFixed(1) + 'B'
        } else if (number >= 1_000_000) {
            return '$' + (number / 1_000_000).toFixed(1) + 'M'
        } else if (number >= 1_000) {
            return '$' + (number / 1_000).toFixed(1) + 'K'
        }
        return '$' + number.toString()
    }

    const handleClickOutside = (event: MouseEvent) => {
        // if (detailsCardRef.current && !detailsCardRef.current.contains(event.target as Node)) {}
        setTooltip('')
    }

    useEffect(() => {
        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [])

    return (
        <Page>
            <Navbar />

            {/* Spinner */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '20px' }}>
                    <Preloader />
                </div>
            ) : (
                <div className="relative min-h-screen overflow-y-auto mb-14">
                    {coin && (
                        <Card className="rounded-2xl shadow-lg border border-gray-600" style={{ marginBottom: 0, overflow: 'hidden' }}>
                            {/* Header Card */}
                            <div className="flex flex-col items-center gap-4">
                                {/* Image & Name */}
                                <div className="flex items-center">
                                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600" />
                                    <span className="text-[20px] font-bold ml-4">{coin.name}</span>
                                    <span className="text-[20px] font-light text-gray-200 ml-2">{coin.symbol?.toUpperCase()}</span>
                                    {coin?.market_cap_rank && (
                                        <span className="text-[16px] text-gray-200 bg-gray-700 px-2 py-1 rounded ml-2">#{coin.market_cap_rank}</span>
                                    )}
                                </div>

                                {/* Price & Price change */}
                                <div className="flex gap-2">
                                    <span className="text-[32px] font-semibold">${cutNumbers(coin.price, 8, true) || 'N/A'}</span>
                                    {coin?.price_change_24h && (
                                        <span className="flex text-[18px] font-semibold" style={{ color: coin.price_change_24h < 0 ? '#ff0000' : '#32cd32' }}>
                                            {coin.price_change_24h < 0 ? (
                                                <IconCaretDownFilled className="w-5 h-5" />
                                            ) : (
                                                <IconCaretUpFilled className="w-5 h-5" />
                                            )}
                                            {cutNumbers(coin.price_change_24h).slice(coin.price_change_24h < 0 ? 1 : 0)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    <Tabs tabs={tabs} activeTab={activeTab} handleTabChange={handleTabChange} />

                    <CoinPriceChart priceData={priceData} />

                    {/* Details Card*/}
                    {coin && (
                        <Card
                            className="rounded-2xl shadow-lg border border-gray-600"
                            style={{ marginBottom: 0, overflow: 'hidden' }}
                            onClick={() => {
                                setTooltip('')
                            }}
                        >
                            {/* Market Cap */}
                            <div className="flex justify-between">
                                <div className="flex items-center gap-1 text-gray-200">
                                    <span className="text-[13px]">Market Cap</span>
                                    <IconAlertCircle
                                        className="cursor-pointer"
                                        size={14}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            setTooltip('market_cap')
                                            setDropdown('')
                                        }}
                                    />
                                </div>
                                {tooltip == 'market_cap' && (
                                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 z-10">
                                        Market Cap = Current Price x Circulating Supply
                                        <br />
                                        <br />
                                        Refers to the total market value of a cryptocurrency’s circulating supply. It is similar to the stock market’s
                                        measurement of multiplying price per share by shares readily available in the market (not held & locked by insiders,
                                        governments)
                                    </div>
                                )}
                                <span className="text-[13px] font-bold">{coin.market_cap ? `$${formatNumber(coin.market_cap)}` : 'N/A'}</span>
                            </div>
                            <div className="w-full border-t border-gray-300 my-3 dark:border-gray-600" />

                            {/* FDV */}
                            <div className="flex justify-between">
                                <div className="flex items-center gap-1 text-gray-200">
                                    <span className="text-[13px]">Fully Diluted Valuation</span>
                                    <IconAlertCircle
                                        className="cursor-pointer"
                                        size={14}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            setTooltip('fdv')
                                            setDropdown('')
                                        }}
                                    />
                                </div>
                                {tooltip == 'fdv' && (
                                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 z-10">
                                        Fully Diluted Valuation (FDV) = Current Price x Total Supply
                                        <br />
                                        <br />
                                        Fully Diluted Valuation (FDV) is the theoretical market capitalization of a coin if the entirety of its supply is in
                                        circulation, based on its current market price. The FDV value is theoretical as increasing the circulating supply of a
                                        coin may impact its market price. Also depending on the tokenomics, emission schedule or lock-up period of a coin's
                                        supply, it may take a significant time before its entire supply is released into circulation.
                                    </div>
                                )}
                                <span className="text-[13px] font-bold">{coin.fdv ? `$${formatNumber(coin.fdv)}` : 'N/A'}</span>
                            </div>
                            <div className="w-full border-t border-gray-300 my-3 dark:border-gray-600" />

                            {/* ATH */}
                            <div className="flex justify-between">
                                <div className="flex items-center gap-1 text-gray-200">
                                    <span className="text-[13px]">All Time High</span>
                                    <IconAlertCircle
                                        className="cursor-pointer"
                                        size={14}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            setTooltip('ath')
                                            setDropdown('')
                                        }}
                                    />
                                </div>
                                {tooltip == 'ath' && (
                                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 z-10">
                                        The highest price ever reached by a cryptocurrency or financial asset in its trading history. It indicates the peak
                                        value and is often a benchmark for performance.
                                    </div>
                                )}
                                <span className="text-[13px] font-bold">{coin.ath ? `$${cutNumbers(coin.ath)}` : 'N/A'}</span>
                            </div>
                            <div className="w-full border-t border-gray-300 my-3 dark:border-gray-600" />

                            {/* ATL */}
                            <div className="flex justify-between">
                                <div className="flex items-center gap-1 text-gray-200">
                                    <span className="text-[13px]">All Time Low</span>
                                    <IconAlertCircle
                                        className="cursor-pointer"
                                        size={14}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            setTooltip('atl')
                                            setDropdown('')
                                        }}
                                    />
                                </div>
                                {tooltip == 'atl' && (
                                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 z-10">
                                        The lowest price ever recorded for a cryptocurrency or financial asset. It represents the minimum value and can
                                        highlight significant market downturns.
                                    </div>
                                )}
                                <span className="text-[13px] font-bold">{coin.atl ? `$${cutNumbers(coin.atl)}` : 'N/A'}</span>
                            </div>
                            <div className="w-full border-t border-gray-300 my-3 dark:border-gray-600" />

                            {/* Categories */}
                            <div className="flex justify-between">
                                <div>
                                    <div className="mt-1 flex items-center gap-1 text-gray-200">
                                        <span className="text-[13px]">Categories</span>
                                        <IconAlertCircle
                                            className="cursor-pointer"
                                            size={14}
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                setTooltip('categories')
                                            }}
                                        />
                                    </div>
                                </div>
                                {tooltip == 'categories' && (
                                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 z-10">
                                        Contract addresses of the Coin.
                                    </div>
                                )}

                                {coin?.categories?.length > 0 && (
                                    <div>
                                        <div className="flex flex-col gap-1">
                                            {/* Display the first contract address */}
                                            <div className="flex gap-2">
                                                <span className="text-[13px] bg-gray-700 px-2 py-1 rounded">
                                                    {coin.categories[0].length > 24 ? `${coin.categories[0].slice(0, 20)}...` : coin.categories[0]}
                                                </span>

                                                {/* Display the "X more" button and handle the toggle */}
                                                {coin.categories.length > 1 && (
                                                    <span
                                                        className="flex items-center text-[13px] bg-gray-700 px-2 py-1 rounded cursor-pointer text-gray-300"
                                                        onClick={(event) => {
                                                            event.stopPropagation()
                                                            setExpandCategories((prev) => !prev)
                                                            setTooltip('')
                                                        }}
                                                    >
                                                        {coin.categories.length - 1} more
                                                        {expandCategories ? (
                                                            <IconChevronUp className="ml-1" size={13} />
                                                        ) : (
                                                            <IconChevronDown className="ml-1" size={13} />
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Display the remaining addresses in a column */}
                                            {expandCategories && (
                                                <div className="flex flex-col items-end gap-1">
                                                    {coin.categories.slice(1).map((e, index) => (
                                                        <span className="px-2 py-1 text-[13px] rounded bg-gray-700">
                                                            {e.length > 32 ? `${e.slice(0, 31)}...` : e}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="w-full border-t border-gray-300 my-3 dark:border-gray-600" />

                            {/* Contract addresses */}
                            <div className="flex justify-between">
                                <div>
                                    <div className="mt-1 flex items-center gap-1 text-gray-200">
                                        <span className="text-[13px]">CA</span>
                                        <IconAlertCircle
                                            className="cursor-pointer"
                                            size={14}
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                setTooltip('contract_addresses')
                                            }}
                                        />
                                    </div>
                                </div>
                                {tooltip == 'contract_addresses' && (
                                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 z-10">
                                        Contract addresses of the Coin.
                                    </div>
                                )}

                                {coin?.contract_addresses?.length > 0 && (
                                    <div>
                                        <div className="flex flex-col gap-1">
                                            {/* Display the first contract address */}
                                            <div className="flex gap-2">
                                                <span className="text-[13px] bg-gray-700 px-2 py-1 rounded">
                                                    {coin.contract_addresses[0].length > 24
                                                        ? `${coin.contract_addresses[0].slice(0, 20)}...`
                                                        : coin.contract_addresses[0]}
                                                </span>

                                                {/* Display the "X more" button and handle the toggle */}
                                                {coin.contract_addresses.length > 1 && (
                                                    <span
                                                        className="flex items-center text-[13px] bg-gray-700 px-2 py-1 rounded cursor-pointer text-gray-300"
                                                        onClick={(event) => {
                                                            event.stopPropagation()
                                                            setExpandAddresses((prev) => !prev)
                                                            setTooltip('')
                                                        }}
                                                    >
                                                        {coin.contract_addresses.length - 1} more
                                                        {expandAddresses ? (
                                                            <IconChevronUp className="ml-1" size={13} />
                                                        ) : (
                                                            <IconChevronDown className="ml-1" size={13} />
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Display the remaining addresses in a column */}
                                            {expandAddresses && (
                                                <div className="flex flex-col items-end gap-1">
                                                    {coin.contract_addresses.slice(1).map((e, index) => (
                                                        <span className="px-2 py-1 text-[13px] rounded bg-gray-700">
                                                            {e.length > 32 ? `${e.slice(0, 31)}...` : e}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="w-full border-t border-gray-300 my-3 dark:border-gray-600" />

                            {/* Twitter */}
                            <div className="flex justify-between">
                                <div className="flex items-center gap-1 text-gray-200">
                                    <span className="text-[13px]">X Page</span>
                                </div>
                                {coin.twitter_screen_name ? (
                                    <a
                                        href={`https://x.com/${coin.twitter_screen_name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[13px] font-semibold underline"
                                    >
                                        {coin.twitter_screen_name[0] != '@' && '@'}
                                        {coin.twitter_screen_name}
                                    </a>
                                ) : (
                                    <span className="text-[13px] text-gray-400">N/A</span>
                                )}
                            </div>
                            <div className="w-full border-t border-gray-300 my-3 dark:border-gray-600" />

                            {/* Homepage links */}
                            <div className="flex justify-between">
                                <div>
                                    <div className="mt-1 flex items-center gap-1 text-gray-200">
                                        <span className="text-[13px]">Homepages</span>
                                        <IconAlertCircle
                                            className="cursor-pointer"
                                            size={14}
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                setTooltip('homepages')
                                            }}
                                        />
                                    </div>
                                </div>
                                {tooltip == 'homepages' && (
                                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 z-10">
                                        Please make sure to check out homepage links as we are not able to check them one by one.
                                    </div>
                                )}

                                {coin?.homepage_links?.length > 0 && (
                                    <div>
                                        <div className="flex flex-col gap-1">
                                            {/* Display the first homepage link */}
                                            <div className="flex gap-2">
                                                <span className="text-[13px] bg-gray-700 px-2 py-1 rounded">
                                                    <a
                                                        href={coin.homepage_links[0]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[13px] font-semibold italic underline"
                                                    >
                                                        {coin.homepage_links[0].length > 22
                                                            ? `${coin.homepage_links[0].slice(0, 18)}...`
                                                            : coin.homepage_links[0]}
                                                    </a>
                                                </span>

                                                {/* Display the "X more" button and handle the toggle */}
                                                {coin.homepage_links.length > 1 && (
                                                    <span
                                                        className="flex items-center text-[13px] bg-gray-700 px-2 py-1 rounded cursor-pointer text-gray-300"
                                                        onClick={(event) => {
                                                            event.stopPropagation()
                                                            setExpandHomepages((prev) => !prev)
                                                            setTooltip('')
                                                        }}
                                                    >
                                                        {coin.homepage_links.length - 1} more
                                                        {expandHomepages ? (
                                                            <IconChevronUp className="ml-1" size={13} />
                                                        ) : (
                                                            <IconChevronDown className="ml-1" size={13} />
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Display the remaining addresses in a column */}
                                            {expandHomepages && (
                                                <div className="flex flex-col items-end gap-1">
                                                    {coin.homepage_links.slice(1).map((e, index) => (
                                                        <a
                                                            key={index}
                                                            href={e}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-[13px] bg-gray-700 px-2 py-1 font-semibold italic underline rounded"
                                                        >
                                                            {e.length > 32 ? `${e.slice(0, 31)}...` : e}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </Page>
    )
}

export default CoinShowPage
