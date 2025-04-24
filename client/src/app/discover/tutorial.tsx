import { CategoryFilter } from '@/components/categoryFilter'
import { ChainFilter } from '@/components/chainFilter'
import { SearchBar } from '@/components/search'
import { setTutorialSendInfo } from '@/store/tutorial/tutorialSlice'
import { useCounterQuery } from '@/store/api/counter.api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Loader } from 'lucide-react'
import { useTutorialsQuery } from '@/store/api/tutorial.api'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import InfiniteScroll from 'react-infinite-scroll-component'
import { TTutorial } from '@/types/tutorial'

import { cn } from '@/lib/utils'
import TutorialCard from '@/components/TutorialCard'

function Filters({}: any) {
    const dispatch = useAppDispatch()
    const tutorialSendInfo = useAppSelector((state) => state.tutorial.tutorialSendInfo)
    const { currentData: totalAcademies, isLoading, isFetching, isUninitialized } = useCounterQuery({ table: 'Tutorial' })
    return (
        <div>
            <div className="mb-6 flex gap-2 flex-wrap items-center w-full">
                <SearchBar onSearch={(e) => dispatch(setTutorialSendInfo({ ...tutorialSendInfo, keyword: e, offset: 0 }))} />
                <CategoryFilter onSelect={(e) => dispatch(setTutorialSendInfo({ ...tutorialSendInfo, categoryId: e ? Number(e) : undefined, offset: 0 }))} />
                <ChainFilter onSelect={(e) => dispatch(setTutorialSendInfo({ ...tutorialSendInfo, chainId: e ? Number(e) : undefined, offset: 0 }))} />
                <div className="ml-auto">
                    {isLoading || isFetching ? (
                        <Loader size={15} className="animate-spin" />
                    ) : (
                        <div className="text-sm font-medium text-muted-foreground">Total Tutorials: {totalAcademies}</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Tutorials() {
    const dispatch = useAppDispatch()
    const tutorialSendInfo = useAppSelector((state) => state.tutorial.tutorialSendInfo)

    const { currentData: tutorials, isLoading, isFetching } = useTutorialsQuery(tutorialSendInfo)

    const handleFetchMore = () => {
        if (!isFetching) {
            dispatch(
                setTutorialSendInfo({
                    ...tutorialSendInfo,
                    offset: tutorialSendInfo.offset + tutorialSendInfo.limit
                })
            )
        }
    }
    return (
        <div className="pt-4">
            <Filters />
            {!tutorials?.length && (isLoading || isFetching) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
                    {Array.from({ length: 15 }).map((_, index) => (
                        <TutorialCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <InfiniteScroll
                    dataLength={tutorials?.length ?? 0}
                    next={() => handleFetchMore()}
                    hasMore={tutorials?.length === tutorialSendInfo.offset + tutorialSendInfo.limit}
                    loader={
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <TutorialCardSkeleton key={index} />
                            ))}
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-2 ">
                        {tutorials?.map((tutorial: TTutorial) => (
                            <TutorialCard tutorial={tutorial} />
                        ))}
                    </div>
                </InfiniteScroll>
            )}
        </div>
    )
}

function TutorialCardSkeleton() {
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
