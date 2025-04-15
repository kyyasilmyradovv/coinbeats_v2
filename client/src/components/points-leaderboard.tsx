'use client'
import { Key, useEffect, useRef, useState } from 'react'
import { usePointsQuery } from '@/store/api/point.api'
import { Card } from '@/components/ui/card'
import { ChevronUp, Loader, Medal, Trophy } from 'lucide-react'
import { TPoint, TPointSendInfo } from '@/types/point'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export function PointsLeaderboard() {
    const [period, setPeriod] = useState<'weekly' | 'overall'>('weekly')
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [changingTab, setChangingTab] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [totalItems, setTotalItems] = useState<TPoint[]>([])
    const [displayItems, setDisplayItems] = useState<TPoint[]>([])
    const [displayRange, setDisplayRange] = useState({ start: 0, end: 50 })

    // Set limit to about the number of rows visible (e.g. 8)
    const limit = 20

    const containerRef = useRef<HTMLDivElement>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)

    const offset = page * limit

    const { data: leaderboard, isLoading, isFetching } = usePointsQuery({ offset, limit, period } as TPointSendInfo, { refetchOnMountOrArgChange: true })

    const handlePeriodChange = (newPeriod: 'weekly' | 'overall') => {
        if (newPeriod === period) return

        setChangingTab(true)
        setPeriod(newPeriod)
        setPage(0)
        setHasMore(true)
        setTotalItems([])
        setDisplayRange({ start: 0, end: 50 })
        if (containerRef.current) {
            containerRef.current.scrollTop = 0
        }
    }

    useEffect(() => {
        if (!isLoading && changingTab) {
            setChangingTab(false)
        }
    }, [isLoading, leaderboard])

    const scrollToTop = () => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            })
        }
    }

    useEffect(() => {
        if (leaderboard?.length) {
            setTotalItems((prev) => {
                // For page 0, always reset the list
                if (page === 0) return [...leaderboard]

                // For subsequent pages, use name as a key for deduplication
                // since items don't have an id property
                const newItemsMap = new Map()

                // First add all existing items to the map
                prev.forEach((item) => newItemsMap.set(item.name, item))

                // Then add new items, replacing any duplicates
                leaderboard.forEach((item) => newItemsMap.set(item.name, item))

                // Convert map back to array and return
                return Array.from(newItemsMap.values())
            })

            if (leaderboard.length < limit) {
                setHasMore(false)
            }
        } else if (leaderboard && leaderboard.length === 0) {
            // Stop fetching as soon as we get an empty array, regardless of page
            setHasMore(false)
        }
    }, [leaderboard, page, limit])

    useEffect(() => {
        if (!totalItems.length) return
        // IMPORTANT: This change ensures we only slice the visible window
        // and that item positions are calculated correctly
        const items = totalItems.slice(displayRange.start, displayRange.end)
        setDisplayItems(items)
    }, [displayRange, totalItems])

    useEffect(() => {
        if (!containerRef.current) return
        const updateVisibleItems = () => {
            if (!containerRef.current) return
            const { scrollTop } = containerRef.current
            const rowHeight = 60 // adjust if your row height differs
            const approximateStart = Math.max(0, Math.floor(scrollTop / rowHeight) - 10)
            const approximateEnd = Math.min(totalItems.length, approximateStart + 70)
            setDisplayRange({ start: approximateStart, end: approximateEnd })
            setShowScrollTop(scrollTop > 300)
        }
        updateVisibleItems()
        const currentRef = containerRef.current
        currentRef.addEventListener('scroll', updateVisibleItems, { passive: true })
        return () => {
            currentRef.removeEventListener('scroll', updateVisibleItems)
        }
    }, [totalItems])

    // Using IntersectionObserver on a sentinel element at the bottom of the list.
    useEffect(() => {
        if (!containerRef.current || !sentinelRef.current) return
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                if (
                    entry.isIntersecting &&
                    !isFetching &&
                    hasMore &&
                    containerRef.current &&
                    containerRef.current.scrollHeight > containerRef.current.clientHeight
                ) {
                    setPage((prev) => prev + 1)
                }
            },
            { root: containerRef.current, threshold: 1.0 }
        )
        observer.observe(sentinelRef.current)
        return () => {
            if (sentinelRef.current) observer.unobserve(sentinelRef.current)
        }
    }, [isFetching, hasMore])

    useEffect(() => {
        if (page === 0) {
            setTotalItems([])
            setDisplayRange({ start: 0, end: 50 })
        }
        console.log(`Page changed: ${page} (offset: ${page * limit})`)
    }, [page])

    useEffect(() => {
        if (totalItems.length === 0 && !isLoading && !isFetching) {
            console.log('Forcing initial fetch')
            setPage(0)
        }
    }, [])

    useEffect(() => {
        setDisplayRange((prev) => ({ ...prev, end: totalItems.length }))
    }, [totalItems])

    const renderRankIcon = (position: number) => {
        if (position === 0) return <Trophy className="h-4 w-4 text-yellow-600" />
        if (position === 1) return <Medal className="h-4 w-4 text-gray-500" />
        if (position === 2) return <Medal className="h-4 w-4 text-amber-700" />
        return null
    }

    return (
        <Card className="overflow-hidden relative">
            <div className="px-4 py-2 border-b">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="text-xl font-semibold">Points Leaderboard</h2>
                    <Tabs value={period} onValueChange={(value) => handlePeriodChange(value as 'weekly' | 'overall')}>
                        <TabsList>
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="overall">All Time</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>
            <div
                ref={containerRef}
                className="h-[450px] overflow-y-auto px-4 py-2 custom-scrollbar"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'
                }}
            >
                {(isLoading && page === 0) || changingTab ? (
                    <div className="flex justify-center py-8">
                        <Loader className="h-6 w-6 animate-spin text-brand" />
                    </div>
                ) : (
                    <>
                        {totalItems.length > 0 ? (
                            <ul className="divide-y relative" style={{ height: `${totalItems.length * 60}px` }}>
                                {displayItems.map((user: TPoint, index: Key | null | undefined) => {
                                    const position = displayRange.start + (typeof index === 'number' ? index : 0)
                                    const isTop3 = position < 3
                                    return (
                                        <li
                                            key={`${user.name}-${position}`}
                                            className={`py-3 flex items-center space-x-3 px-2 ${
                                                isTop3 ? 'bg-muted/30 rounded-md my-1 shadow-sm top-3-item' : ''
                                            } ${position === 0 ? 'top-1-item' : ''}`}
                                            style={{
                                                position: 'absolute',
                                                top: `${position * 60}px`,
                                                left: 0,
                                                right: 0
                                            }}
                                        >
                                            <div
                                                className={`flex-shrink-0 flex items-center justify-center rounded-full ${
                                                    position === 0
                                                        ? 'w-8 h-8 bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400'
                                                        : position === 1
                                                        ? 'w-8 h-8 bg-gray-100 text-gray-700 ring-2 ring-gray-400'
                                                        : position === 2
                                                        ? 'w-8 h-8 bg-amber-100 text-amber-700 ring-2 ring-amber-400'
                                                        : 'w-7 h-7 text-muted-foreground'
                                                }`}
                                            >
                                                <span className={`font-medium ${isTop3 ? 'text-base' : 'text-sm'}`}>{position + 1}</span>
                                            </div>
                                            <div className="flex-grow overflow-hidden flex items-center">
                                                {isTop3 && renderRankIcon(position)}
                                                <p className={`truncate ${isTop3 ? 'font-semibold ml-1 text-base' : 'font-medium'}`}>{user.name}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <div
                                                    className={`px-3 py-1 rounded-full border border-brand text-brand ${
                                                        isTop3 ? 'font-semibold text-sm' : 'text-sm font-medium'
                                                    }`}
                                                >
                                                    {period === 'overall' ? user.pointCount : user.lastWeekPointCount} XP
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                                {isFetching && page > 0 && (
                                    <li className="py-4 flex justify-center">
                                        <Loader className="h-5 w-5 animate-spin text-brand" />
                                    </li>
                                )}
                                {!hasMore && <li className="py-3 text-center text-muted-foreground text-sm">No more results</li>}
                            </ul>
                        ) : (
                            <div className="text-center text-muted-foreground py-6">No users found</div>
                        )}
                    </>
                )}
                <div ref={sentinelRef}></div>
                {showScrollTop && (
                    <Button
                        onClick={scrollToTop}
                        size="sm"
                        variant="outline"
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 rounded-full h-10 w-10 p-0 shadow-md"
                        aria-label="Scroll to top"
                    >
                        <ChevronUp className="h-5 w-5" />
                    </Button>
                )}
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(155, 155, 155, 0.5);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(155, 155, 155, 0.7);
                }
                @keyframes subtle-glow {
                    0% {
                        box-shadow: 0 0 5px rgba(249, 115, 22, 0.2);
                    }
                    50% {
                        box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
                    }
                    100% {
                        box-shadow: 0 0 5px rgba(249, 115, 22, 0.2);
                    }
                }
                .top-3-item {
                    animation: subtle-glow 3s ease-in-out infinite;
                }
                .top-1-item {
                    animation: subtle-glow 2.5s ease-in-out infinite;
                    background: linear-gradient(45deg, rgba(253, 230, 138, 0.2), rgba(252, 211, 77, 0), rgba(253, 230, 138, 0.2));
                    background-size: 200% 200%;
                    animation-name: subtle-glow, gradient-shift;
                }
                @keyframes gradient-shift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
            `}</style>
        </Card>
    )
}
