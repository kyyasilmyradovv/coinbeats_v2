'use client'
import RaffleCard from '@/components/raffleCard'
import { useRafflesQuery } from '@/store/api/raffle.api'
import { Skeleton } from '@/components/ui/skeleton'
import { TRaffle } from '@/types/raffle'
import { Clock, Gift, Trophy, Ticket } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export default function Raffles() {
    const { currentData: raffles, isLoading, isFetching } = useRafflesQuery(null)

    return (
        <div className="container mx-auto pt-4 pb-8 px-4">
            {!raffles?.length && (isLoading || isFetching) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <RaffleCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 ">
                    {raffles?.map((raffle: TRaffle) => (
                        <RaffleCard raffle={raffle} />
                    ))}
                </div>
            )}
        </div>
    )
}

function RaffleCardSkeleton() {
    return (
        <div className="flex flex-col relative rounded-lg mb-4">
            <Card className="h-full flex flex-col py-4 gradient-border">
                <CardHeader className="flex items-center justify-between px-4 align-middle">
                    {/* Badge for platform/academy type */}
                    <Skeleton className="h-6 w-20 rounded-full" />
                    {/* Badge for deadline date */}
                    <Skeleton className="h-6 w-28 rounded-full" />
                </CardHeader>

                <CardContent className="flex items-center justify-center flex-col gap-3">
                    {/* Avatar skeleton - exact same size as actual Avatar */}
                    <Skeleton className="h-16 w-16 rounded-full" />

                    {/* Title skeleton - match text-lg font-medium */}
                    <Skeleton className="h-6 w-32 rounded-md" />

                    {/* Countdown timer skeleton - match the container height with padding */}
                    <div className="w-full bg-muted/30 rounded-md p-2 my-1" style={{ height: '38px' }}>
                        <div className="flex items-center gap-1.5 justify-center">
                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                            <Skeleton className="h-5 w-40 rounded-md" />
                        </div>
                    </div>

                    {/* Raffle details skeleton - match each row exactly */}
                    <div className="flex flex-col gap-2 w-full mt-2">
                        {/* Reward row */}
                        <div className="flex justify-between items-center h-6">
                            <Skeleton className="h-4 w-16 rounded" />
                            <Skeleton className="h-4 w-20 rounded" />
                        </div>

                        {/* Winners row */}
                        <div className="flex justify-between items-center h-6">
                            <Skeleton className="h-4 w-18 rounded" />
                            <Skeleton className="h-4 w-10 rounded" />
                        </div>

                        {/* Entries row */}
                        <div className="flex justify-between items-center h-6">
                            <Skeleton className="h-4 w-24 rounded" />
                            <Skeleton className="h-4 w-8 rounded" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
