'use client'
import Image from 'next/image'
import { constructImageUrl } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useParams } from 'next/navigation'
import { useAcademyQuery } from '@/store/api/academy.api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftRight, BrickWallIcon, Check, ChevronDown, Chrome, List, Loader, Recycle, Rocket, Send, Twitter, Users } from 'lucide-react'
import { TAcademySingle } from '@/types/academy'
import { Button } from '@/components/ui/button'
import coinsEarnedAnimationData from '@/animations/earned-coins.json'
import Lottie from 'react-lottie'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { SOCIALS } from '@/shared/socials'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Quiz } from '@/components/quiz'
import { useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setLoginModalOpen } from '@/store/general/generalSlice'

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
                    <div className="container mx-auto ">
                        <Card className="h-full py-2 px-2 ">
                            {/* Ticker */}
                            <div className="overflow-auto flex items-center">
                                <div className="flex items-center">
                                    <Rocket />
                                    <p className="text-lg font-bold ml-2">Ticker:</p>
                                </div>
                                <Badge variant={'outline'} className="ml-4 gradient-background ">
                                    {academy?.ticker ?? 'N/A'}
                                </Badge>
                            </div>
                            {/* Categories */}
                            <div className="overflow-auto flex items-center flex-wrap gap-2">
                                <div className="flex">
                                    <List />
                                    <p className="text-lg font-bold ml-2">Categories:</p>
                                </div>
                                {academy?.categories?.length
                                    ? academy?.categories?.map((e) => (
                                          <Badge key={e.id} variant={'outline'} className="ml-2 bg-amber-800 text-[#FFFFFF]">
                                              {e.name ?? 'N/A'}
                                          </Badge>
                                      ))
                                    : 'N/A'}
                            </div>
                            {/* Chains */}
                            <div className="overflow-auto flex items-center flex-wrap gap-2">
                                <div className="flex">
                                    <Recycle />
                                    <p className="text-lg font-bold ml-2">Chains:</p>
                                </div>
                                {academy?.categories?.length
                                    ? academy?.chains?.map((e) => (
                                          <Badge variant={'outline'} className="ml-2 bg-amber-800 text-[#FFFFFF]">
                                              {e.name ?? 'N/A'}
                                          </Badge>
                                      ))
                                    : 'N/A'}
                            </div>
                        </Card>
                    </div>
                    <SocialLinks academy={academy} />
                    <div className="w-full flex items-center justify-center animate-float-button mb-4 mt-6">
                        <Button variant="outline" className="text-brand border-brand cursor-pointer bg-inherit">
                            <ArrowLeftRight />
                            TRADE & SNIPE
                        </Button>
                    </div>

                    <EarnedCoins academy={academy} />
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
}

function EarnedCoins({ academy }: TEarnedCoinsProps) {
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
            <Card className="px-2 py-1 flex-1 flex flex-row items-center justify-between">
                <div className="flex flex-row gap-2 items-center text-xs md:text-[14px]">
                    {academy?.points?.length === 0 ? (
                        <p className="gradient-text">Earn {academy?.xp} points by doing quiz!</p>
                    ) : (
                        <p className="gradient-text">
                            Earned Poins: {academy?.points?.[0]?.value}/{academy?.fomoNumber! > +academy?.pointCount! ? academy?.fomoXp : academy?.xp}
                        </p>
                    )}
                </div>

                <div>
                    <Lottie options={coinsEarnedAnimation} height={36} width={36} />
                </div>
            </Card>
        </div>
    )
}
interface TSocialLinksProps {
    academy: TAcademySingle | undefined
}

function SocialLinks({ academy }: TSocialLinksProps) {
    return (
        <div className="h-full gap-4 flex items-center justify-center my-8">
            {SOCIALS.map((social) => (
                <Link href={academy?.[social.hrefKey]} key={1} scroll={false}>
                    {social.icon}
                </Link>
            ))}
        </div>
    )
}

export default function Academy() {
    const params = useParams()
    const id = params.academyId

    const { currentData: academy, isLoading, isFetching } = useAcademyQuery(id as string, { skip: !id })

    return (
        <div className="container mx-auto pt-4  pb-8 px-4 ">
            {isLoading || isFetching ? (
                <Loading />
            ) : (
                <div>
                    <div className="mb-4 relative overflow-hidden rounded-lg">
                        {/* Background image with blur and darkening overlay */}
                        <div className="inset-0 z-0">
                            {/* Dark overlay */}
                            <div className="absolute inset-0 bg-black/60 z-10"></div>
                            <div
                                style={{
                                    filter: `blur(2px)`,
                                    transform: `scale(${155 / 100}) translate(0%, ${(73 - 50) / 5}%)`,
                                    height: '100%',
                                    width: '100%',
                                    position: 'absolute'
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
                            <Avatar className="h-18 w-18 ">
                                <AvatarImage src={constructImageUrl(academy?.logoUrl)} alt="Logo" />
                                <AvatarFallback className="text-xl">{academy?.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-4xl font-bold gradient-text mt-1 mb-3">{academy?.name}</h2>
                            <div className="flex w-full items-center justify-center gap-12">
                                <Badge variant="default" className="flex items-center">
                                    <p>{academy?.points?.length ? academy?.points?.[0]?.value : academy?.xp}</p>
                                    <Check className="h-5.5 w-5.5" />
                                </Badge>
                                <Badge variant="default" className="flex items-center gap-1 ">
                                    <Users className="h-3.5 w-3.5" />
                                    <p>{academy?.pointCount}</p>
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <ActTypes academy={academy} />
                </div>
            )}
        </div>
    )
}

function Loading() {
    return (
        <div className="w-full h-[80vh] flex items-center justify-center">
            <Loader size={50} className="animate-spin" />
        </div>
    )
}
