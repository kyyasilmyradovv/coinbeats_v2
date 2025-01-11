// src/pages/PointsControlPage.js
import { useEffect, useRef, useState } from 'react'
import { Page, Preloader, Card } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import axiosInstance from '~/api/axiosInstance'
import SearchIcon from '@mui/icons-material/Search'
import NoDataFoundComponent from '~/components/common/NoDataFound'

interface RowInterface {
    id: number
    value: number
    createdAt: string
    user_name: string
    description: string
    task_name: string
    academy_name: string
}

export default function PointsControlPage() {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [rows, setRows] = useState<RowInterface[]>([])
    const [loading, setLoading] = useState(false)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false)

    const fetchRows = async (reset = false) => {
        if (loading || (!hasMore && !reset)) return
        setLoading(true)
        if (reset) setRows([])

        try {
            console.log('offset------- ', offset)
            const response = await axiosInstance.get(`/api/points-control?limit=20&offset=${reset ? 0 : offset}&keyword=${encodeURIComponent(searchKeyword)}`)
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
                {/* Search  */}
                <div className="flex flex-col ml-4 mr-4 mt-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border dark:border-gray-600 mb-2">
                    {/* Search */}
                    <div className="flex items-center justify-between">
                        <input
                            type="text"
                            placeholder="Search by username..."
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
                </div>

                {/* Cards */}
                <div className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover overflow-y-auto">
                    <div className="relative z-10">
                        {/* Map over rows to display all rows */}
                        <div className="flex flex-col flex-grow">
                            {rows.map((row, index) => (
                                <div key={index}>
                                    {/* Card Content */}
                                    <Card className="rounded-2xl shadow-lg border dark:border-gray-600" style={{ marginBottom: 0, overflow: 'hidden' }}>
                                        <div style={{ width: '100%' }} className="flex flex-col gap-2">
                                            {/* Xp & Description */}
                                            <div className="flex gap-[2%]">
                                                <div className="flex flex-col w-[49%]">
                                                    <span className="text-sm text-gray-300">Xp:</span>
                                                    <span className="text-[16px] md:text-lg font-semibold">{row.value}</span>
                                                </div>
                                                <div className="flex flex-col w-[49%]">
                                                    <span className="text-sm text-gray-300">Desc:</span>
                                                    <span className="text-[16px] md:text-lg font-semibold">
                                                        {row?.description?.slice(0, 15) ||
                                                            row?.task_name?.slice(0.15) ||
                                                            row?.academy_name?.slice(0.15) + ' academy'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-300">Date:</span>
                                                    <span className="text-[16px] md:text-lg font-semibold">{new Date(row.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* User */}
                                            <div>
                                                <div className="flex flex-col ">
                                                    <span className="text-sm text-gray-300">User:</span>
                                                    <span className="text-[16px] md:text-lg font-semibold">@{row.user_name?.slice(0, 50)}</span>
                                                </div>
                                            </div>
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
