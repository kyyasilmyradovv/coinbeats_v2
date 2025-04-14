'use client'
import RaffleCard from '@/components/raffleCard'
import { useRafflesQuery } from '@/store/api/raffle.api'
import { Skeleton } from '@/components/ui/skeleton'
import { TRaffle } from '@/types/raffle'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'

export default function Raffles() {
    const { currentData: raffles, isLoading, isFetching } = useRafflesQuery(null)
    const [view, setView] = useState<'all' | 'my'>('all')

    // Filter raffles based on selected tab
    const filteredRaffles = React.useMemo(() => {
        if (!raffles) return []

        if (view === 'my') {
            return raffles.filter((raffle: { yourRaffleCount: number }) => raffle.yourRaffleCount && raffle.yourRaffleCount > 0)
        }

        return raffles
    }, [raffles, view])

    const hasRaffles = filteredRaffles.length > 0

    return (
        <div className="container mx-auto pt-4 pb-8 px-4">
            {/* Raffles View Toggle */}
            <div className="flex justify-center mb-6">
                <Tabs defaultValue="all" className="w-[300px]" onValueChange={(value) => setView(value as 'all' | 'my')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="all">All Raffles</TabsTrigger>
                        <TabsTrigger value="my">My Raffles</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {!raffles?.length && (isLoading || isFetching) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <RaffleCardSkeleton key={index} />
                    ))}
                </div>
            ) : !hasRaffles && view === 'my' ? (
                <div className="text-center py-10">
                    <h3 className="text-lg font-medium">No Raffles Found</h3>
                    <p className="text-muted-foreground mt-2">You don't have any raffle entries yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredRaffles.map((raffle: TRaffle) => (
                        <RaffleCard key={raffle.name} raffle={raffle} />
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
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                </CardHeader>

                <CardContent className="flex items-center justify-center flex-col gap-3">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-md" />

                    <div className="w-full bg-muted/30 rounded-md p-2 my-1" style={{ height: '38px' }}>
                        <div className="flex items-center gap-1.5 justify-center">
                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                            <Skeleton className="h-5 w-40 rounded-md" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full mt-2">
                        <div className="flex justify-between items-center h-6">
                            <Skeleton className="h-4 w-16 rounded" />
                            <Skeleton className="h-4 w-20 rounded" />
                        </div>

                        <div className="flex justify-between items-center h-6">
                            <Skeleton className="h-4 w-18 rounded" />
                            <Skeleton className="h-4 w-10 rounded" />
                        </div>

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
