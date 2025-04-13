'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InfiniteScroll from 'react-infinite-scroll-component'
import AcademyCard from '@/components/academyCard'
import { ROUTES } from '@/shared/links'
import coinsEarnedAnimationData from '@/animations/earned-coins.json'
import bunnyHappyAnimationData from '../animations/bunny-happy.json'
import dynamic from 'next/dynamic'
const Lottie = dynamic(() => import('react-lottie'), { ssr: false })
import Image from 'next/image'
import { Loader, Send } from 'lucide-react'
import { useAcademiesQuery } from '@/store/api/academy.api'
import { TAcademy, TAcademySendInfo } from '@/types/academy'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAcademySendInfo } from '@/store/academy/academySlice'
import { useCategoryOptionsQuery } from '@/store/api/category.api'
import { useChainOptionsQuery } from '@/store/api/chain.api'
import { Command, CommandInput } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategoryFilter } from '@/components/categoryFilter'
import { ChainFilter } from '@/components/chainFilter'
import { SearchBar } from '@/components/search'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useCounterQuery } from '@/store/api/counter.api'

// Sorting options component
interface SortOptionsProps {}

const formatPoints = (points: number): string => {
    if (points >= 1_000_000_000) {
        return (points / 1_000_000_000).toFixed(1) + 'B'
    } else if (points >= 1_000_000) {
        return (points / 1_000_000).toFixed(1) + 'M'
    } else if (points >= 1_000) {
        return (points / 1_000).toFixed(1) + 'K'
    }
    return points.toString()
}

function ExtraDetail() {
    const { theme } = useTheme()
    const coinsEarnedAnimation = {
        loop: true,
        autoplay: true,
        animationData: coinsEarnedAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }
    const bunnyHappyAnimation = {
        loop: true,
        autoplay: true,
        animationData: bunnyHappyAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }
    return (
        <div className="mb-6 flex gap-2 w-full">
            <Card className="px-0 py-1 flex items-center">
                <CardContent className="px-1 flex flex-col justify-center items-center">
                    <div className="flex flex-row items-center justify-between w-full gap-2">
                        <div className="w-8 h-8">
                            <Lottie options={coinsEarnedAnimation} height={36} width={36} />
                        </div>
                        <div className="text-md font-bold flex-grow text-end mr-2 mt-1">{formatPoints(1244124)}</div>
                    </div>

                    <div className="flex flex-row items-center mt-2 w-full">
                        <div className="w-8 h-8 flex items-center justify-center ">
                            {true ? (
                                <Lottie options={bunnyHappyAnimation} height={32} width={32} />
                            ) : (
                                <Image className="h-8 w-8" src={'/bunny-head.png'} alt="Bunny Mascot" />
                            )}
                        </div>
                        <div className="flex flex-col file:text-md font-bold text-black dark:text-white flex-grow text-end mr-2 mt-1">
                            <div className="flex flex-row items-center justify-center">
                                <span className="text-center">{500}</span>
                            </div>
                            <div className="flex flex-row items-center justify-center">
                                <span className={cn('text-xs', theme === 'dark' ? 'text-gray-300' : 'text-gray-500')}>Rank</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="h-full gap-1 flex flex-col flex-1">
                <Card className="px-2 py-1 flex-1 flex flex-row items-center justify-between">
                    <div className="flex flex-row gap-2 items-center text-xs md:text-[14px]">
                        <Send className="h-5 w-5 text-blue-500" />
                        <p>Invite a Friend</p>
                    </div>
                    <Button variant="outline" className="text-brand border-brand cursor-pointer text-xs md:text-[14px] px-1.5">
                        Invite +3500
                        <Image src={'/coin-stack.png'} alt="Coin-Beats" height={18} width={18} />
                    </Button>
                </Card>
                <Card className="px-2 py-1 flex-1 flex flex-row items-center justify-between">
                    <div className="flex flex-row gap-2 items-center text-xs md:text-[14px]">
                        <p>🙏</p>
                        <p>Leave us feadback</p>
                    </div>
                    <Button variant="outline" className="text-brand border-brand cursor-pointer  text-xs md:text-[14px] px-1.5">
                        Feadback +500
                        <Image src={'/coin-stack.png'} alt="Coin-Beats" height={18} width={18} />
                    </Button>
                </Card>
            </div>
        </div>
    )
}

function Filters({}: SortOptionsProps) {
    const dispatch = useAppDispatch()
    const academySendInfo = useAppSelector((state) => state.academy.academySendInfo)
    const { currentData: totalAcademies, isLoading, isFetching, isUninitialized } = useCounterQuery({ table: 'Academy' })
    return (
        <div>
            <div className="mb-6 flex gap-2 flex-wrap items-center w-full">
                <SearchBar onSearch={(e) => dispatch(setAcademySendInfo({ ...academySendInfo, keyword: e, offset: 0 }))} />
                <CategoryFilter onSelect={(e) => dispatch(setAcademySendInfo({ ...academySendInfo, categoryId: e ? Number(e) : undefined, offset: 0 }))} />
                <ChainFilter onSelect={(e) => dispatch(setAcademySendInfo({ ...academySendInfo, chainId: e ? Number(e) : undefined, offset: 0 }))} />
                <div className="ml-auto">
                    {isLoading || isFetching ? (
                        <Loader size={15} className="animate-spin" />
                    ) : (
                        <div className="text-sm font-medium text-muted-foreground">Total Academies: {totalAcademies}</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Home() {
    const dispatch = useAppDispatch()
    const academySendInfo = useAppSelector((state) => state.academy.academySendInfo)

    const { currentData: academies, isLoading, isFetching, isUninitialized } = useAcademiesQuery(academySendInfo)

    const handleFetchMore = () => {
        if (!isFetching) {
            dispatch(
                setAcademySendInfo({
                    ...academySendInfo,
                    offset: academySendInfo.offset + academySendInfo.limit
                })
            )
        }
    }

    return (
        <div className="container mx-auto pt-4  pb-4 px-4">
            <ExtraDetail />
            <Filters />
            {/* <SortOptions onSortChange={() => {}} /> */}
            {!academies?.length && (isLoading || isFetching) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
                    {Array.from({ length: 15 }).map((_, index) => (
                        <AnalysisCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <InfiniteScroll
                    dataLength={academies?.length ?? 0}
                    next={() => handleFetchMore()}
                    hasMore={academies?.length === academySendInfo.offset + academySendInfo.limit}
                    loader={
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <AnalysisCardSkeleton key={index} />
                            ))}
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 ">
                        {academies?.map((academy: TAcademy) => (
                            <AcademyCard academy={academy} />
                        ))}
                    </div>
                </InfiniteScroll>
            )}
        </div>
    )
}

// Skeleton component for loading state
function AnalysisCardSkeleton() {
    return (
        <div className="flex flex-col relative rounded-lg mb-4">
            <Card className="h-full flex flex-col py-4 gradient-border">
                <CardHeader className="flex items-center justify-between px-4">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-5 w-12 rounded" />
                </CardHeader>

                <CardContent className="flex flex-col items-center gap-3">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                </CardContent>

                <CardFooter className="flex justify-end px-4 relative">
                    <Skeleton className="h-5 w-12 rounded" />
                    <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/4 flex items-center justify-center -mb-4">
                        <Skeleton className="h-10 w-24 rounded-md " />
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
