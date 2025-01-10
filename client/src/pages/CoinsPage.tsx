// src/pages/MarketsPage.js
import { useEffect, useRef, useState } from 'react'
import { Page, Button, Preloader, Card } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import axiosInstance from '~/api/axiosInstance'
import SearchIcon from '@mui/icons-material/Search'
import NoDataFoundComponent from '~/components/common/NoDataFound'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import NorthRoundedIcon from '@mui/icons-material/NorthRounded'
import SouthRoundedIcon from '@mui/icons-material/SouthRounded'

interface RowInterface {
    name: string
    symbol: string
    image: string
    price: number
    market_cap: number
    market_cap_rank: number
    price_change_1h: number
    price_change_24h: number
    price_change_7d: number
}

export default function CoinsPage() {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [rows, setRows] = useState<RowInterface[]>([])
    const [loading, setLoading] = useState(false)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)
    const [sortColumn, setSortColumn] = useState('id')
    const [sortDirection, setSortDirection] = useState('desc')
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false)

    const fetchRows = async (reset = false) => {
        if (loading || (!hasMore && !reset)) return
        setLoading(true)
        if (reset) setRows([])

        try {
            const response = await axiosInstance.get(
                `/api/coins?limit=20&offset=${reset ? 0 : offset}&keyword=${encodeURIComponent(searchKeyword)}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`
            )
            const newRows = response?.data

            if (reset) {
                setRows(newRows)
                setOffset(newRows?.length)
                setHasMore(newRows?.length > 0)
            } else if (newRows?.length > 0) {
                setRows((prev) => [...prev, ...newRows])
                setOffset((prev) => prev + 20)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('Error fetching coins:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRows()
    }, [])

    const handleScroll = () => {
        const container = containerRef.current
        if (!container) return

        const { scrollTop, scrollHeight, clientHeight } = container

        // Check if near the bottom (adjust offset as needed)
        if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !loading) {
            fetchRows()
        }

        setShowScrollToTopButton(scrollTop > 100)
    }

    useEffect(() => {
        const container = containerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll)
            }
        }
    }, [hasMore, loading])

    const handleSearch = () => {
        setHasMore(true)
        fetchRows(true)
    }

    const handleSortColumn = (column: string) => {
        setSortColumn(column)
        setHasMore(true)
        fetchRows(true)
    }

    const handleSortDirection = () => {
        if (loading) return
        setSortDirection((prev) => (prev == 'asc' ? 'desc' : 'asc'))
        setHasMore(true)
        fetchRows(true)
    }

    function cutNumbers(value: number, length = 5, isPrice: boolean = false) {
        if (isPrice && value < 0.0001) {
            return '<0.000'
        }

        let newValue = value.toString()
        newValue = newValue.slice(0, length - (newValue.endsWith('.') ? 1 : newValue.endsWith('.0') ? 2 : 0))

        return newValue
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

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {/* Main div */}
            <div
                className="relative min-h-screen overflow-y-auto"
                style={{ height: '100vh', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                ref={containerRef}
            >
                {/* Search & Filters & Sort  */}
                <div className="flex flex-col ml-4 mr-4 mt-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border dark:border-gray-600 mb-2">
                    {/* Search */}
                    <div className="flex items-center justify-between">
                        <input
                            type="text"
                            placeholder="Search coins..."
                            className="flex-grow px-2 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch()
                                }
                            }}
                        />
                        <button
                            onClick={handleSearch}
                            className="ml-4 px-4 py-2 bg-gradient-to-l from-pink-500 to-purple-500 text-white rounded-md shadow hover:opacity-90 disabled:opacity-50 focus:outline-none"
                        >
                            <SearchIcon />
                        </button>
                    </div>

                    {/* Toggle for Filter and Sort */}
                    <button
                        className="flex items-center justify-center mt-4 text-sm text-gray-600 dark:text-gray-300 focus:outline-none"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <FiChevronUp className="mr-2" /> : <FiChevronDown className="mr-2" />}
                        Filter {3.7}K Coins
                    </button>

                    {/* Filter and Sort */}
                    <div
                        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out`}
                        style={{
                            maxHeight: isExpanded ? '200px' : '0px'
                        }}
                    >
                        <div className="mt-4">
                            {/* Filter */}
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium dark:text-gray-300">Filter & Sort:</label>
                                <div>
                                    <select
                                        onChange={(e) => handleSortColumn(e.target.value)}
                                        className=" px-1 py-1.5 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none"
                                    >
                                        <option value="id">Added Date</option>
                                        <option value="price">Price</option>
                                        <option value="market_cap">Market Cap</option>
                                        <option value="market_cap_rank">Market Cap Rank</option>
                                        <option value="price_change_1h">1h Price Change</option>
                                        <option value="price_change_24h">24h Price Change</option>
                                        <option value="price_change_7d">7d Price Change</option>
                                    </select>

                                    <button
                                        onClick={() => handleSortDirection()}
                                        className="ml-2 p-1 rounded-md bg-gray-700 "
                                        aria-label="Toggle Sort Direction"
                                    >
                                        {sortDirection == 'asc' ? (
                                            <NorthRoundedIcon className="text-gray-600 dark:text-gray-300" />
                                        ) : (
                                            <SouthRoundedIcon className="text-gray-600 dark:text-gray-300" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards */}
                <div
                    className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover overflow-y-auto"
                    // style={{ height: '100vh', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    // ref={containerRef}
                >
                    <div className="relative z-10">
                        {/* Map over rows to display all coins */}
                        <div className="flex flex-col flex-grow">
                            {rows.map((row, index) => (
                                <div key={index}>
                                    {/* Card Content */}
                                    <Card className="rounded-2xl shadow-lg border dark:border-gray-600" style={{ marginBottom: 0, overflow: 'hidden' }}>
                                        {/* Image & Name*/}
                                        <div className="flex flex-col lg:text-center">
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={row.image}
                                                    alt={row.name}
                                                    className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-600"
                                                />
                                                <h3 className="text-lg font-bold">{row.name?.slice(0, 36)}</h3>
                                            </div>

                                            {/* Divider */}
                                            <div className="w-full border-t border-gray-300 my-4 dark:border-gray-600"></div>

                                            {/* Infos (Lines) */}
                                            <div style={{ width: '100%' }} className="flex flex-col gap-2">
                                                {/* Price & Market Cap & Market Cap Rank */}
                                                <div className="flex gap-[1.5%]">
                                                    {/* Price */}
                                                    <div className="flex flex-col w-[32%]">
                                                        <span className="text-sm text-gray-300">Price:</span>
                                                        <span className="text-lg font-semibold" style={{ color: '#ea8d0b' }}>
                                                            {row.price != null && '$'}
                                                            {cutNumbers(row.price, 6, true) || 'N/A'}
                                                        </span>
                                                    </div>

                                                    {/* Market Cap */}
                                                    <div className="flex flex-col w-[32%]">
                                                        <span className="text-sm text-gray-300">Market Cap:</span>
                                                        <span className="text-lg font-semibold" style={{ color: '#ea8d0b' }}>
                                                            {formatPrice(row.market_cap)}
                                                        </span>
                                                    </div>

                                                    {/* Market Cap Rank */}
                                                    <div className="flex flex-col w-[32%]">
                                                        <span className="text-sm text-gray-300">Market Rank:</span>
                                                        <span className="text-lg font-semibold" style={{ color: '#0c56b0' }}>
                                                            {' '}
                                                            {row.market_cap_rank != null && '#'}
                                                            {row.market_cap_rank || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Price Changes */}
                                                <div className="flex gap-[1.5%]">
                                                    {/* 1h Change */}
                                                    <div className="flex flex-col w-[32%]">
                                                        <span className="text-sm text-gray-300">1h Change:</span>
                                                        <span
                                                            className="text-lg font-bold"
                                                            style={{
                                                                color: row.price_change_1h != null ? (row.price_change_1h < 0 ? '#8d1010' : 'green') : 'white'
                                                            }}
                                                        >
                                                            {row.price_change_1h != null && (
                                                                <span className="text-sm mr-1">{row.price_change_1h < 0 ? '▼' : '▲'}</span>
                                                            )}
                                                            {row.price_change_1h != null ? `${cutNumbers(row.price_change_1h)}%` : 'N/A'}
                                                        </span>
                                                    </div>

                                                    {/* 24h Change */}
                                                    <div className="flex flex-col w-[32%]">
                                                        <span className="text-sm text-gray-300">24h Change:</span>
                                                        <span
                                                            className="text-lg font-bold"
                                                            style={{
                                                                color: row.price_change_24h != null ? (row.price_change_24h < 0 ? '#8d1010' : 'green') : 'white'
                                                            }}
                                                        >
                                                            {row.price_change_24h != null && (
                                                                <span className="text-sm mr-1">{row.price_change_24h < 0 ? '▼' : '▲'}</span>
                                                            )}
                                                            {row.price_change_24h != null ? `${cutNumbers(row.price_change_24h)}%` : 'N/A'}
                                                        </span>
                                                    </div>

                                                    {/* 7d Change */}
                                                    <div className="flex flex-col w-[32%]">
                                                        <span className="text-sm text-gray-300">7d Change:</span>
                                                        <span
                                                            className="text-lg font-bold"
                                                            style={{
                                                                color: row.price_change_7d != null ? (row.price_change_7d < 0 ? '#8d1010' : 'green') : 'white'
                                                            }}
                                                        >
                                                            {row.price_change_7d != null && (
                                                                <span className="text-sm mr-1">{row.price_change_7d < 0 ? '▼' : '▲'}</span>
                                                            )}
                                                            {row.price_change_7d != null ? `${cutNumbers(row.price_change_7d)}%` : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Open button */}
                                            {/* <Button
                                            outline
                                            rounded
                                            className="!w-18 !mx-auto !h-6 !whitespace-nowrap text-white"
                                            style={{
                                                background: 'linear-gradient(to left, #ff0077, #7700ff)'
                                            }}
                                        >
                                            Open
                                        </Button> */}
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>

                        {/* Spinner */}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '20px' }}>
                                <Preloader />
                            </div>
                        )}

                        {/* No data */}
                        {!loading && rows?.length === 0 && <NoDataFoundComponent />}
                    </div>
                </div>

                {/* Move to Top Button */}
                {showScrollToTopButton && (
                    <button
                        onClick={() => {
                            if (containerRef.current) {
                                containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
                            }
                        }}
                        style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            backgroundColor: '#5d6670',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            cursor: 'pointer',
                            zIndex: 1000,
                            fontSize: '20px'
                        }}
                    >
                        ↑
                    </button>
                )}
            </div>
        </Page>
    )
}
