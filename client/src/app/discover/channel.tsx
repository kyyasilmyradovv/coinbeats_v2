import { CategoryFilter } from '@/components/categoryFilter'
import { ChainFilter } from '@/components/chainFilter'
import { SearchBar } from '@/components/search'
import { setChannelSendInfo } from '@/store/channel/channelSlice'
import { useCounterQuery } from '@/store/api/counter.api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader } from 'lucide-react'
import { useChannelsQuery } from '@/store/api/channel.api'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import InfiniteScroll from 'react-infinite-scroll-component'
import { TChannel } from '@/types/channel'

import { cn } from '@/lib/utils'
import ChannelCard from '@/components/ChannelCard'

function Filters({}: any) {
    const dispatch = useAppDispatch()
    const channelSendInfo = useAppSelector((state) => state.channel.channelSendInfo)
    const { currentData: totalAcademies, isLoading, isFetching, isUninitialized } = useCounterQuery({ table: 'YoutubeChannel' })
    return (
        <div>
            <div className="mb-6 flex gap-2 flex-wrap items-center w-full">
                <SearchBar onSearch={(e) => dispatch(setChannelSendInfo({ ...channelSendInfo, keyword: e, offset: 0 }))} />
                <CategoryFilter onSelect={(e) => dispatch(setChannelSendInfo({ ...channelSendInfo, categoryId: e ? Number(e) : undefined, offset: 0 }))} />
                <ChainFilter onSelect={(e) => dispatch(setChannelSendInfo({ ...channelSendInfo, chainId: e ? Number(e) : undefined, offset: 0 }))} />
                <div className="ml-auto">
                    {isLoading || isFetching ? (
                        <Loader size={15} className="animate-spin" />
                    ) : (
                        <div className="text-sm font-medium text-muted-foreground">Total Channels: {totalAcademies}</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Channels() {
    const dispatch = useAppDispatch()
    const channelSendInfo = useAppSelector((state) => state.channel.channelSendInfo)

    const { currentData: channels, isLoading, isFetching } = useChannelsQuery(channelSendInfo)

    const handleFetchMore = () => {
        if (!isFetching) {
            dispatch(
                setChannelSendInfo({
                    ...channelSendInfo,
                    offset: channelSendInfo.offset + channelSendInfo.limit
                })
            )
        }
    }
    return (
        <div className="pt-4">
            <Filters />
            {!channels?.length && (isLoading || isFetching) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
                    {Array.from({ length: 15 }).map((_, index) => (
                        <ChannelCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <InfiniteScroll
                    dataLength={channels?.length ?? 0}
                    next={() => handleFetchMore()}
                    hasMore={channels?.length === channelSendInfo.offset + channelSendInfo.limit}
                    loader={
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <ChannelCardSkeleton key={index} />
                            ))}
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-2 ">
                        {channels?.map((channel: TChannel) => (
                            <ChannelCard channel={channel} />
                        ))}
                    </div>
                </InfiniteScroll>
            )}
        </div>
    )
}

function ChannelCardSkeleton() {
    return (
        <Card className={cn('relative overflow-hidden rounded-3xl border-none  backdrop-blur-lg shadow-xl transition', 'flex flex-col min-h-[420px]')}>
            {/* Cover Skeleton */}
            <div className="relative h-36 w-full">
                <Skeleton className="w-full h-full absolute inset-0 object-cover" />
                {/* Avatar Skeleton */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <Skeleton className="h-20 w-20 rounded-full border-[4px]  shadow-lg" />
                </div>
            </div>

            <CardContent className="mt-14 px-6 text-center flex flex-col gap-3">
                {/* Name & Bio */}
                <Skeleton className="h-5 w-32 mx-auto rounded" />
                <Skeleton className="h-4 w-48 mx-auto rounded" />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-16 rounded-xl" />
                    ))}
                </div>
            </CardContent>

            <CardFooter className="mt-auto px-6 py-4 flex justify-center">
                <Skeleton className="h-9 w-28 rounded-full" />
            </CardFooter>
        </Card>
    )
}
