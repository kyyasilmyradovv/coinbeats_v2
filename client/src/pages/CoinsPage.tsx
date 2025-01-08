// src/pages/MarketsPage.js
import { useEffect, useRef, useState } from 'react'
import { Page, Button, Preloader, Card } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import axiosInstance from '~/api/axiosInstance'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import VisibilityIcon from '@mui/icons-material/Visibility'
import TagIcon from '@mui/icons-material/Tag'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'

interface RowInterface {
    name: string
    symbol: string
    image: string
    price: string
    view_count: number
    market_cup_rank: number
    price_change_24h: string
}

export default function CoinsPage() {
    const [rows, setRows] = useState<RowInterface[]>([])
    const [loading, setLoading] = useState(false)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const fetchRows = async (reset = false) => {
        if (loading || (!hasMore && !reset)) return
        setLoading(true)
        try {
            const response = await axiosInstance.get(`/api/coins?limit=20&offset=${reset ? 0 : offset}`)
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

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {/* Cards */}
            <div
                className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover overflow-y-auto"
                style={{ height: '100vh' }}
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

                                            {/* Percentage Stamp */}
                                            {row.price_change_24h != null && (
                                                <div
                                                    className={`absolute top-0 left-0 transform -rotate-45 bg-opacity-90 px-1 py-0.5 rounded-md text-xs font-bold ${
                                                        row.price_change_24h[0] == '-' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                                    }`}
                                                    style={{ top: '-5px', left: '-15px' }}
                                                >
                                                    {row.price_change_24h[0] != '-' && '+'}
                                                    {row.price_change_24h.slice(0, 5)}%
                                                </div>
                                            )}
                                        </div>

                                        {/* Name & Price & View count */}
                                        <div className="flex-grow">
                                            {/* Name */}
                                            <h3 className="text-lg font-bold">{row.name?.slice(0, 18)}</h3>

                                            {/* Price & 24h Price Change */}
                                            <div className="flex items-center ">
                                                <AttachMoneyIcon className="text-green-500 mr-2" />
                                                <span className="truncate">{row.price.slice(0, 7)}</span>

                                                {/* {row.price_change_24h != null && (
                                                    <div className={`border rounded ml-2 dark:border-${row.price_change_24h[0] == '-' ? 'red' : 'green'}-600`}>
                                                        {row.price_change_24h[0] == '-' ? (
                                                            <TrendingDownIcon className="text-red-500 ml-0 mr-0" />
                                                        ) : (
                                                            <TrendingUpIcon className="text-green-500 ml-0 mr-0" />
                                                        )}
                                                        <span
                                                            className={
                                                                row.price_change_24h[0] == '-' ? 'text-red-500 font-bold mr-1' : 'text-green-500 font-bold mr-1'
                                                            }
                                                        >
                                                            {row.price_change_24h.slice(0, 5)}%
                                                        </span>
                                                    </div>
                                                )} */}
                                            </div>

                                            {/* View count & MArketcup rank */}
                                            <div className="flex items-center">
                                                <VisibilityIcon className="text-blue-500 mr-2" />
                                                <span>{row.view_count}</span>
                                                {row.market_cup_rank > 0 && (
                                                    <>
                                                        <TagIcon className="text-blue-500 ml-2 mr-2" />
                                                        <span>{row.market_cup_rank}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Open button */}
                                        <Button
                                            outline
                                            rounded
                                            className="!w-18 !mx-auto !h-6 !whitespace-nowrap text-white"
                                            style={{
                                                background: 'linear-gradient(to left, #ff0077, #7700ff)'
                                            }}
                                        >
                                            Open
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Spinner */}
                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '12px' }}>
                            <Preloader />
                        </div>
                    )}
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
