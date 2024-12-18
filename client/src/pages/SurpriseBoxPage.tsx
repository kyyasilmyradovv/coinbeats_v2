import React, { useState, useEffect, useRef } from 'react'
import { Page, BlockTitle, Table, TableCell, TableRow, Preloader } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axiosInstance from '../api/axiosInstance'

interface PointInterface {
    id: number
    value: number
    createdAt: string
    username: string
}

const SurpriseBoxPage: React.FC = () => {
    const [points, setPoints] = useState<Partial<PointInterface>[]>([])
    const [offset, setOffset] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')

    const containerRef = useRef<HTMLDivElement | null>(null)

    const fetchPoints = async (reset = false) => {
        if (loading || (!hasMore && !reset)) return
        setLoading(true)
        try {
            const response = await axiosInstance.get(
                `/api/surprise-box/points?limit=20&offset=${reset ? 0 : offset}&keyword=${encodeURIComponent(searchKeyword)}`
            )
            const newPoints = response.data

            if (reset) {
                setPoints(newPoints)
                setOffset(newPoints.length)
                setHasMore(newPoints.length > 0)
            } else if (newPoints.length > 0) {
                setPoints((prevPoints) => [...prevPoints, ...newPoints])
                setOffset((prevOffset) => prevOffset + 20)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('Error fetching surprise points:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleScroll = () => {
        const container = containerRef.current
        if (!container) return
        const { scrollTop, scrollHeight, clientHeight } = container

        if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !loading) {
            fetchPoints()
        }
    }

    const handleSearch = () => {
        setHasMore(true)
        fetchPoints(true)
    }

    useEffect(() => {
        fetchPoints()
    }, [])

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

            <div style={{ zIndex: 200, position: 'relative' }}>
                <Sidebar />
            </div>

            <BlockTitle large style={{ marginTop: '14px', zIndex: 100, position: 'relative' }}>
                Surprise Points
            </BlockTitle>

            <div style={{ height: '43px', margin: '32px 10px 0 0', display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{
                        padding: '8px',
                        border: '0.5px solid #ccc',
                        borderRadius: '4px',
                        width: '100%',
                        maxWidth: '300px',
                        background: 'transparent'
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{
                        marginLeft: '8px',
                        backgroundColor: '#007aff',
                        borderRadius: '4px',
                        width: '83px'
                    }}
                >
                    {loading && searchKeyword ? <Preloader size="small" style={{ color: '#444' }} /> : <p>Search</p>}
                </button>
            </div>

            <div
                ref={containerRef}
                style={{
                    marginTop: '14px',
                    overflowY: 'auto',
                    border: '0.5px solid #979797',
                    maxHeight: '99%',
                    scrollbarWidth: 'thin', // For Firefox
                    scrollbarColor: '#555 #333'
                }}
            >
                <Table className="!w-full border">
                    <thead style={{ position: 'sticky', top: 0, background: 'black', zIndex: 100 }}>
                        <TableRow>
                            <TableCell style={{ fontWeight: 'bold', color: '#fff' }}>Points</TableCell>
                            <TableCell style={{ fontWeight: 'bold', color: '#fff' }}>Date</TableCell>
                            <TableCell style={{ fontWeight: 'bold', color: '#fff' }}>Username</TableCell>
                        </TableRow>
                    </thead>
                    <tbody>
                        {points.map((point, index) => (
                            <TableRow key={`${point.id}-${index}`}>
                                <TableCell>{point.value} XP</TableCell>
                                <TableCell>{point.createdAt}</TableCell>
                                <TableCell>@{point.username}</TableCell>
                            </TableRow>
                        ))}
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    <Preloader size="small" />
                                </TableCell>
                            </TableRow>
                        )}
                        {!hasMore && !loading && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center" style={{ opacity: 0.7 }}>
                                    No more data available
                                </TableCell>
                            </TableRow>
                        )}
                    </tbody>
                </Table>
            </div>
        </Page>
    )
}

export default SurpriseBoxPage
