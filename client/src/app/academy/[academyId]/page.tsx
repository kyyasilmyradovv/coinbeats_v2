'use client'
import Image from 'next/image'
import { constructImageUrl } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useParams } from 'next/navigation'
import { useAcademyQuery, useAcademyContentQuery } from '@/store/api/academy.api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { ArrowLeftRight, Check, List, Recycle, Rocket, Users } from 'lucide-react'
import { TAcademySingle } from '@/types/academy'
import { Button } from '@/components/ui/button'
import coinsEarnedAnimationData from '@/animations/earned-coins.json'
import Lottie from 'react-lottie'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { SOCIALS } from '@/shared/socials'
import { Quiz } from '@/components/quiz'
import { useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setLoginModalOpen } from '@/store/general/generalSlice'
import { AcademySkeleton } from './academySkeleton'
import { AcademyContentSkeleton } from './academyContentSkeleton'

interface TTabsProps {
    academy: TAcademySingle | undefined
}

function ActTypes({ academy }: TTabsProps) {
    const dispatch = useAppDispatch()
    const [activeTab, setActiveTab] = useState('general')

    const handleTabChange = (tab: string) => {
        const token = localStorage.getItem('coinbeatsAT')
        if (tab === 'quiz' && !token) {
            dispatch(setLoginModalOpen(true))
            return
        }
        setActiveTab(tab)
    }

    const handleSwitchToQuiz = () => {
        handleTabChange('quiz')
    }

    return (
        <section className="mb-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="general">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">GENERAL</TabsTrigger>
                    <TabsTrigger value="quiz">QUIZ</TabsTrigger>
                    <TabsTrigger value="tutorial">TUTORIAL</TabsTrigger>
                    <TabsTrigger value="quests">QUESTS</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="mt-2">
                    <div className="container mx-auto">
                        <Card className="p-4">
                            <div className="grid grid-cols-2 lg:flex lg:justify-between lg:px-6 gap-4 lg:gap-0">
                                {/* Ticker */}
                                <div className="lg:w-1/3">
                                    <div className="flex items-center mb-2">
                                        <Rocket className="h-3.5 w-3.5 text-brand mr-1.5 flex-shrink-0" />
                                        <p className="text-sm font-medium">Ticker</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {academy?.ticker ? (
                                            <Badge variant="outline" className="gradient-background text-white">
                                                {academy.ticker}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">N/A</span>
                                        )}
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="lg:w-1/3 lg:flex lg:flex-col lg:items-center">
                                    <div className="flex items-center mb-2">
                                        <List className="h-3.5 w-3.5 text-brand mr-1.5 flex-shrink-0" />
                                        <p className="text-sm font-medium truncate">Categories</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {academy?.categories?.length ? (
                                            academy.categories.map((e) => (
                                                <Badge key={e.id} variant="outline" className="py-1 gradient-background text-white">
                                                    {e.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-sm">N/A</span>
                                        )}
                                    </div>
                                </div>

                                {/* Chains */}
                                <div className="col-span-2 lg:col-span-1 lg:w-1/3 lg:flex lg:flex-col lg:items-end">
                                    <div className="flex items-center mb-2">
                                        <Recycle className="h-3.5 w-3.5 text-brand mr-1.5 flex-shrink-0" />
                                        <p className="text-sm font-medium truncate">Chains</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {academy?.chains?.length ? (
                                            academy.chains.map((e) => (
                                                <Badge key={e.id} variant="outline" className="gradient-background text-white">
                                                    {e.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-sm">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t"></div>

                            {/* Social Links */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center mb-2">
                                    <p className="text-sm font-medium text-center">Connect with the Project</p>
                                </div>
                                <div className="flex items-center justify-center gap-5">
                                    {SOCIALS.map((social, index) => (
                                        <Link
                                            href={academy?.[social.hrefKey] || '#'}
                                            key={index}
                                            scroll={false}
                                            className="text-muted-foreground hover:text-brand hover:scale-110 transition-all"
                                        >
                                            {social.icon}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="w-full flex items-center justify-center animate-float-button mb-4 mt-6">
                        <Button variant="outline" className="text-brand border-brand cursor-pointer bg-inherit">
                            <ArrowLeftRight />
                            TRADE & SNIPE
                        </Button>
                    </div>

                    <AcademyContent academyId={academy?.id ? String(academy.id) : ''} />
                    <EarnedCoins academy={academy} onSwitchToQuiz={handleSwitchToQuiz} />
                </TabsContent>
                <TabsContent value="quiz" className="mt-2">
                    <Quiz />
                </TabsContent>
            </Tabs>
        </section>
    )
}

interface TEarnedCoinsProps {
    academy: TAcademySingle | undefined
    onSwitchToQuiz?: () => void
}

function EarnedCoins({ academy, onSwitchToQuiz }: TEarnedCoinsProps) {
    const coinsEarnedAnimation = {
        loop: true,
        autoplay: true,
        animationData: coinsEarnedAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    return (
        <div className="h-full gap-1 flex flex-col flex-1">
            <Card className="px-3 py-2 flex-1 flex flex-row items-center justify-between">
                <div className="flex-shrink-0">
                    <Lottie options={coinsEarnedAnimation} height={36} width={36} />
                </div>

                <div className="flex-grow text-center text-xs md:text-[14px]">
                    {!academy?.points || academy?.points?.length === 0 ? (
                        <p className="gradient-text cursor-pointer hover:scale-105 transition-transform" onClick={onSwitchToQuiz}>
                            Earn {academy?.xp} points by doing quiz!
                        </p>
                    ) : (
                        <p className="gradient-text">Earned Points: {academy?.points?.[0]?.value}</p>
                    )}
                </div>

                <div className="flex-shrink-0">
                    {(!academy?.points || academy?.points?.length === 0) && (
                        <Button
                            onClick={onSwitchToQuiz}
                            variant="default"
                            size="sm"
                            className="gradient-background text-white border-0 whitespace-nowrap hover:scale-105 hover:brightness-110 transition-all duration-200 cursor-pointer"
                        >
                            Start Challenge?
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    )
}

type AcademyContentItem = {
    question: string
    answer: string
}

interface AcademyContentProps {
    academyId: string | string[]
}

function AcademyContent({ academyId }: AcademyContentProps) {
    const { data: contentItems, isLoading } = useAcademyContentQuery(academyId as string, {
        skip: !academyId
    })

    // Show skeleton while loading instead of returning null
    if (isLoading) {
        return <AcademyContentSkeleton />
    }

    if (!contentItems?.length) {
        return null
    }

    // Helper function to render tokenomics data
    const renderTokenomicsData = (jsonString: string) => {
        try {
            const tokenomicsData = JSON.parse(jsonString)

            // Check if all values are empty strings or "N/A"
            const allEmpty = Object.values(tokenomicsData).every((value) => value === '' || value === 'N/A' || (Array.isArray(value) && value.length === 0))

            if (allEmpty) {
                return <p className="text-muted-foreground">N/A</p>
            }

            // Convert to array, filter empty values, and sort by display value length
            const sortedEntries = Object.entries(tokenomicsData)
                .filter(([_, value]) => value !== '' && value !== 'N/A' && !(Array.isArray(value) && value.length === 0))
                .map(([key, value]) => {
                    const displayValue = Array.isArray(value) ? value.join(', ') : String(value)
                    return { key, value, displayValue, length: displayValue.length }
                })
                .sort((a, b) => a.length - b.length)

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {sortedEntries.map(({ key, displayValue }) => (
                        <div key={key} className="flex flex-col border rounded-md p-3 bg-muted/30">
                            <span className="text-xs text-muted-foreground mb-1 capitalize">{key}</span>
                            <span className="text-sm break-words">{displayValue}</span>
                        </div>
                    ))}
                </div>
            )
        } catch (e) {
            return <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: jsonString }} />
        }
    }

    return (
        <div className="mt-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">About this Project</h3>
            <Card className="p-4">
                <div className="space-y-4">
                    {contentItems.map((item: AcademyContentItem, index: number) => {
                        const isTokenomics = item.question.toLowerCase().includes('tokenomics')
                        const isJsonString = item.answer.trim().startsWith('{') && item.answer.trim().endsWith('}')

                        return (
                            <div key={index} className={index > 0 ? 'mt-6 pt-4 border-t' : ''}>
                                <h4 className="text-base font-medium mb-2">{item.question}</h4>
                                {isTokenomics && isJsonString ? (
                                    renderTokenomicsData(item.answer)
                                ) : (
                                    <div
                                        className="text-sm text-muted-foreground prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: item.answer }}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    )
}

export default function Academy() {
    const params = useParams()
    const id = params.academyId

    const { currentData: academy, isLoading, isFetching } = useAcademyQuery(id as string, { skip: !id })

    return (
        <>
            {isLoading || isFetching ? (
                <AcademySkeleton />
            ) : (
                <div className="container mx-auto pt-4 pb-8 px-4">
                    <div className="mb-4 relative overflow-hidden rounded-lg">
                        {/* Background image */}
                        <div className="inset-0 z-0">
                            <div className="absolute inset-0 bg-black/60 z-10"></div>
                            <div
                                className="absolute w-full h-full blur-xs scale-[1.55] origin-center"
                                style={{
                                    transform: `scale(${155 / 100}) translate(0%, ${(73 - 50) / 5}%)`
                                }}
                            >
                                <Image
                                    src={constructImageUrl(academy?.coverPhotoUrl)}
                                    alt="Background"
                                    className="w-full h-full object-cover"
                                    width={1200}
                                    height={1000}
                                    priority
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 relative z-20 flex flex-col items-center justify-center">
                            <Avatar className="h-18 w-18">
                                <AvatarImage src={constructImageUrl(academy?.logoUrl)} alt="Logo" />
                                <AvatarFallback className="text-xl">{academy?.name?.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-4xl font-bold gradient-text mt-1 mb-3">{academy?.name}</h2>
                            <div className="flex w-full items-center justify-center gap-12">
                                <Badge variant="default" className="flex items-center">
                                    <p>{academy?.points?.length ? academy?.points?.[0]?.value : academy?.xp}</p>
                                    <Check className="h-5.5 w-5.5" />
                                </Badge>
                                <Badge variant="default" className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    <p>{academy?.pointCount}</p>
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <ActTypes academy={academy} />
                </div>
            )}
        </>
    )
}
