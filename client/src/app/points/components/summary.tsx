'use client'
import { useHistoryQuery } from '@/store/api/point.api'
import { constructImageUrl } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { ChevronUp, Loader } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import { TPointHistory } from '@/types/point'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

function formatDate(dateString: string) {
    const date = new Date(dateString)
    const month = date.toLocaleString('default', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
}

export function Summary() {
    const [token, setToken] = useState<string | null>(null)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [allActivities, setAllActivities] = useState<TPointHistory[]>([])

    const { data: session, status } = useSession()
    const activityContainerRef = useRef<HTMLDivElement>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)

    const limit = 10
    const offset = page * limit

    const {
        data: activities,
        isLoading,
        isFetching
    } = useHistoryQuery(
        { offset, limit },
        {
            skip: !token,
            refetchOnMountOrArgChange: true
        }
    )

    // Get token on mount for SSR compatibility
    useEffect(() => {
        try {
            setToken(localStorage.getItem('coinbeatsAT'))
        } catch (error) {
            console.log('Local storage not available')
        }
    }, [])

    const totalPoints = allActivities?.reduce((sum: number, item: TPointHistory) => sum + item.value, 0) || 0

    // Append fetched activities to state
    useEffect(() => {
        if (activities?.length) {
            setAllActivities((prev) => (page === 0 ? [...activities] : [...prev, ...activities]))
            if (activities.length < limit) {
                setHasMore(false)
            }
        } else if (activities && activities.length === 0) {
            setHasMore(false)
        }
    }, [activities, page, limit])

    // Infinite scroll via IntersectionObserver (like leaderboard)
    useEffect(() => {
        const container = activityContainerRef.current
        const sentinel = sentinelRef.current
        if (!container || !sentinel || !hasMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                if (entry.isIntersecting && !isFetching && container.scrollHeight > container.clientHeight) {
                    setPage((prev) => prev + 1)
                }
            },
            {
                root: container,
                threshold: 0.5,
                rootMargin: '50px'
            }
        )

        observer.observe(sentinel)
        return () => {
            if (sentinel) observer.unobserve(sentinel)
        }
    }, [isFetching, hasMore, page])

    // Show/hide scroll-to-top button
    useEffect(() => {
        const container = activityContainerRef.current
        if (!container) return

        const handleScroll = () => {
            setShowScrollTop(container.scrollTop > 100)
        }

        container.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            container.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const scrollToTop = () => {
        if (activityContainerRef.current) {
            activityContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            })
        }
    }

    // Initial loading state
    if (token === null) {
        return (
            <Card className="p-4">
                <h3 className="font-semibold mb-2">My Points Summary</h3>
                <p className="text-muted-foreground text-sm mb-2">
                    Stats and information about your points will appear here. Sign in to track your point earnings and climb the leaderboard!
                </p>
            </Card>
        )
    }

    if ((status === 'loading' || isLoading) && page === 0) {
        return (
            <Card className="p-4">
                <h3 className="font-semibold mb-3">Your Points</h3>
                <div className="flex justify-center py-4">
                    <Loader className="h-5 w-5 animate-spin text-brand" />
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-4">
            <h3 className="font-semibold">My Points Summary</h3>

            <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-1">Total earned</p>
                <p className="text-2xl font-bold text-brand">{totalPoints} XP</p>
            </div>

            {allActivities.length > 0 ? (
                <>
                    <h4 className="text-sm font-medium">XP Activity</h4>

                    <div ref={activityContainerRef} className="space-y-3 max-h-[348px] overflow-y-auto pr-1 custom-scrollbar relative">
                        {allActivities.map((item: TPointHistory, idx) => (
                            <div
                                key={`activity-${idx}-${item.createdAt}`}
                                className="flex items-center space-x-3 p-2 hover:bg-muted/30 rounded-md transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    {item.academy ? (
                                        <div className="h-10 w-10 relative rounded-full overflow-hidden border">
                                            <Image
                                                src={constructImageUrl(item?.academy?.logoUrl || '/coin-stack.png')}
                                                alt={item?.academy?.logoUrl}
                                                className="w-full h-full object-cover"
                                                width={1200}
                                                height={1000}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                            <Image src="/coin-stack.png" alt="coin-icon" className="w-6 h-6 object-cover" width={1200} height={1000} priority />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-sm font-medium truncate">{item.academy?.name || item.verificationTask?.name || 'Task'}</p>
                                        <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20 text-xs ml-1">
                                            +{item.value}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                                </div>
                            </div>
                        ))}

                        {/* Sentinel element to trigger additional loading */}
                        <div ref={sentinelRef} className="h-5 w-full" />

                        {/* Loading indicator when fetching more */}
                        {isFetching && page > 0 && (
                            <div className="py-2 flex justify-center">
                                <Loader className="h-4 w-4 animate-spin text-brand" />
                            </div>
                        )}

                        {/* End of results message */}
                        {!hasMore && allActivities.length > 5 && (
                            <div className="py-2 text-center text-xs text-muted-foreground">No more activities to show</div>
                        )}

                        {/* Scroll-to-top button at bottom-right */}
                        {showScrollTop && (
                            <Button
                                onClick={scrollToTop}
                                size="sm"
                                variant="outline"
                                className="absolute bottom-2 right-1 z-10 rounded-full h-8 w-8 p-0 shadow-md bg-card dark:bg-muted"
                                aria-label="Scroll to top"
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">You haven't earned any points yet. Complete tasks and join academies to start earning!</p>
            )}

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
            `}</style>
        </Card>
    )
}
