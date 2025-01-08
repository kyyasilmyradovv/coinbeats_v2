// src/pages/MarketsPage.js
import { useEffect, useRef, useState } from 'react'
import { Page, Button, Preloader, Card } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import axiosInstance from '~/api/axiosInstance'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import VisibilityIcon from '@mui/icons-material/Visibility'
import TagIcon from '@mui/icons-material/Tag'
import SearchIcon from '@mui/icons-material/Search'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import NoDataFoundComponent from '~/components/common/NoDataFound'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import NorthRoundedIcon from '@mui/icons-material/NorthRounded'
import SouthRoundedIcon from '@mui/icons-material/SouthRounded'
import VerticalAlignTopRoundedIcon from '@mui/icons-material/VerticalAlignTopRounded'
import VerticalAlignBottomRoundedIcon from '@mui/icons-material/VerticalAlignBottomRounded'

interface RowInterface {
    name: string
    symbol: string
    image: string
    price: string
    view_count: number
    market_cup_rank: number
    price_change_24h: string
    ath: string
    atl: string
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

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {/* Search & Filters & Sort  */}
            <div className="flex flex-col ml-4 mr-4 mt-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border dark:border-gray-600 mb-2">
                {/* Search */}
                <div className="flex items-center justify-between">
                    <input
                        type="text"
                        placeholder="Search coins..."
                        className={`flex-grow px-2 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none ${
                            loading ? 'opacity-50 pointer-events-none' : ''
                        }`}
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
                    {isExpanded ? (
                        <>
                            <FiChevronUp className="mr-2" />
                            Hide Filters & Sort
                        </>
                    ) : (
                        <>
                            <FiChevronDown className="mr-2" />
                            Show Filters & Sort
                        </>
                    )}
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
                                    <option value="market_cup_rank">Market Cap Rank</option>
                                    <option value="price_change_24h">24h Price Change</option>
                                    <option value="ath">All Time High</option>
                                    <option value="atl">All Time Low</option>
                                </select>

                                <button onClick={() => handleSortDirection()} className="ml-2 p-1 rounded-md bg-gray-700 " aria-label="Toggle Sort Direction">
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
                style={{ height: '100vh', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                ref={containerRef}
            >
                <div className="relative z-10">
                    {/* Map over rows to display all coins */}
                    <div className="flex flex-col flex-grow">
                        {rows.map((row, index) => (
                            <div key={index}>
                                <Card className="rounded-2xl shadow-lg border dark:border-gray-600" style={{ marginBottom: 0, overflow: 'hidden' }}>
                                    {/* Card Content */}
                                    <div className="flex items-center">
                                        <div className="relative">
                                            {/* Image */}
                                            <img
                                                src={row.image}
                                                alt={row.name}
                                                className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-600 mr-3"
                                            />
                                        </div>

                                        {/* Name & Price & View count */}
                                        <div className="flex-grow">
                                            {/* Name */}
                                            <h3 className="text-lg font-bold">{row.name?.slice(0, 18)}</h3>

                                            {/* Price & 24h Price Change */}
                                            <div className="flex items-center mt-1">
                                                <AttachMoneyIcon className="text-green-500 mr-2" />
                                                <span className="truncate">{row.price.slice(0, 7)}</span>

                                                {row.price_change_24h != null && (
                                                    <div className="flex items-center">
                                                        {row.price_change_24h[0] == '-' ? (
                                                            <ArrowDropDownIcon className="text-red-500 ml-1" />
                                                        ) : (
                                                            <ArrowDropUpIcon className="text-green-500 ml-1" />
                                                        )}
                                                        <span
                                                            className={row.price_change_24h[0] == '-' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}
                                                        >
                                                            {row.price_change_24h.slice(
                                                                row.price_change_24h[0] == '-' ? 1 : 0,
                                                                row.price_change_24h[4] == '.' ? 4 : 5
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ATH & ATL & MCR */}
                                            <div className="flex items-center mt-1 gap-1">
                                                <div className="flex items-center w-[38%] lg:w-[20%]">
                                                    <VerticalAlignTopRoundedIcon className="text-blue-500" />
                                                    <span>{row.ath?.slice(0, 8) || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center w-[38%] lg:w-[20%]">
                                                    <VerticalAlignBottomRoundedIcon className="text-red-500" />
                                                    <span>{row.atl?.slice(0, 8) || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center w-[24%] lg:w-[10%]">
                                                    <TagIcon className="text-blue-500" />
                                                    <span>{row.market_cup_rank || 'N/A'}</span>
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
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px' }}>
                            <Preloader />
                        </div>
                    )}

                    {/* No data */}
                    {!loading && rows?.length === 0 && <NoDataFoundComponent />}
                </div>
            </div>

            {/* Move to Top Button */}
            {containerRef.current && containerRef.current.scrollTop > 100 && (
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
                        zIndex: 1000
                    }}
                >
                    ↑
                </button>
            )}
        </Page>
    )
}
