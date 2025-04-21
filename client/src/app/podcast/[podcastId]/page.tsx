'use client'

import Loading from '@/components/loading'
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { constructImageUrl } from '@/lib/utils'
import { SOCIALSDISCOVER } from '@/shared/socials'
import { usePodcastQuery } from '@/store/api/podcast.api'
import { Avatar } from '@radix-ui/react-avatar'
import { List, Recycle, Send, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import PodcastSkeleton from './podcastSkleton'
import { TPodcastSingle } from '@/types/podcast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TTabsProps {
    podcast: TPodcastSingle | undefined
}

function ActTypes({ podcast }: TTabsProps) {
    const [activeTab, setActiveTab] = useState('general')

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
    }

    return (
        <section className="mb-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="general">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">GENERAL</TabsTrigger>
                    <TabsTrigger value="tasks">TASKS</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="mt-2">
                    <div className="container mx-auto">
                        <Card className="p-4">
                            <div className="grid grid-cols-1 lg:flex lg:justify-between lg:px-6 gap-4 lg:gap-0">
                                {/* Categories */}
                                <div className="lg:w-1/3 lg:flex lg:flex-col lg:items-start">
                                    <div className="flex items-center mb-2">
                                        <List className="h-3.5 w-3.5 text-brand mr-1.5 flex-shrink-0" />
                                        <p className="text-sm font-medium truncate">Categories</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {podcast?.categories?.length ? (
                                            podcast.categories.map((e) => (
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
                                        {podcast?.chains?.length ? (
                                            podcast.chains.map((e) => (
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

                            <div className="border-t my-4" />

                            {/* Social Links */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center mb-2">
                                    <p className="text-sm font-medium text-center">Connect with the Project</p>
                                </div>
                                <div className="flex items-center justify-center gap-5">
                                    {SOCIALSDISCOVER.filter((social) => !!podcast?.[social.hrefKey])?.map((social, index) => (
                                        <Link
                                            href={podcast?.[social.hrefKey] || '#'}
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
                </TabsContent>
                <TabsContent value="tasks" className="mt-2">
                    <div className="h-full gap-1 flex flex-col flex-1">
                        <Card className="px-3 py-2 flex-1 flex flex-row items-center justify-between">
                            <div className="flex flex-row gap-2 items-center text-xs md:text-[14px]">
                                <X className="h-7 w-7 " />
                                <div className="flex flex-col">
                                    <p>Follow {podcast?.name} on X?</p>
                                    <p className=" flex items-center">
                                        <span>+500</span>
                                        <Image src={'/coin-stack.png'} alt="Coin-Beats" height={18} width={18} />
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 ">
                                <Button variant="outline" className="background-brand text-white cursor-pointer text-xs md:text-[14px] px-1.5">
                                    Follow
                                </Button>
                                <Button variant="outline" className="text-brand border-brand cursor-pointer text-xs md:text-[14px] px-1.5">
                                    Verify
                                </Button>
                            </div>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    )
}

export default function Podcast() {
    const params = useParams()
    const id = params.podcastId

    const { currentData: podcast, isLoading, isFetching } = usePodcastQuery(id as string, { skip: !id })

    return (
        <>
            {isLoading || isFetching ? (
                <PodcastSkeleton />
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
                                    src={constructImageUrl(podcast?.coverPhotoUrl)}
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
                                <AvatarImage src={constructImageUrl(podcast?.logoUrl)} alt="Logo" />
                                <AvatarFallback className="text-xl">{podcast?.name?.slice(0, 2)}</AvatarFallback>
                            </Avatar>

                            <h2 className="text-2xl font-bold mb-3 text-white">{podcast?.name}</h2>
                            <p className="mb-2 text-white/90 text-center">{podcast?.bio}</p>

                            <p className="text-white/70 text-sm mt-1">Visited {podcast?.visitCount?.toLocaleString()} times</p>

                            <p className="text-white/80 mt-4 text-sm">{podcast?.contentOrigin}</p>
                        </div>
                    </div>
                    <ActTypes podcast={podcast} />
                </div>
            )}
        </>
    )
}
