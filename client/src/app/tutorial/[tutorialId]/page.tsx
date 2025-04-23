'use client'
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { constructImageUrl } from '@/lib/utils'
import { useTutorialQuery } from '@/store/api/tutorial.api'
import { Avatar } from '@radix-ui/react-avatar'
import { List, Recycle, Send, X } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import TutorialSkeleton from './tutorialSkleton'

export default function Tutorial() {
    const params = useParams()
    const id = params.tutorialId

    const { currentData: tutorial, isLoading, isFetching } = useTutorialQuery(id as string, { skip: !id })

    return (
        <>
            {isLoading || isFetching ? (
                <TutorialSkeleton />
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
                                    src={constructImageUrl(tutorial?.coverPhotoUrl)}
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
                                <AvatarImage src={constructImageUrl(tutorial?.logoUrl)} alt="Logo" />
                                <AvatarFallback className="text-xl">{tutorial?.title?.slice(0, 2)}</AvatarFallback>
                            </Avatar>

                            <h2 className="text-2xl font-bold mb-3 text-white">{tutorial?.title}</h2>
                            <p className="mb-2 text-white/90 text-center">{tutorial?.description}</p>
                            <p className="text-white/70 text-sm mt-1">Watched {tutorial?.visitCount?.toLocaleString()} times</p>
                        </div>
                    </div>
                    <div className="container mx-auto">
                        <Card className="p-4">
                            {tutorial?.contentUrl && (
                                <div className="mt-0">
                                    <Card className="p-4 shadow-lg border-none bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
                                        <div className="flex flex-col items-center justify-center text-center gap-4">
                                            {/* Type Badge */}
                                            <Badge
                                                variant="outline"
                                                className="uppercase tracking-wide text-xs text-white border-white/30 bg-white/5 px-3 py-1.5 rounded-full"
                                            >
                                                {tutorial.type?.replace(/_/g, ' ')}
                                            </Badge>

                                            {/* Video Embed */}
                                            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${new URL(tutorial.contentUrl).searchParams.get('v')}`}
                                                    title={tutorial.type}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="w-full h-full"
                                                ></iframe>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}
                            <div className="border-t my-4" />
                            <div className="grid grid-cols-1 lg:flex lg:justify-between lg:px-6 gap-4 lg:gap-0">
                                {/* Categories */}
                                <div className="lg:w-1/3 lg:flex lg:flex-col lg:items-start">
                                    <div className="flex items-center mb-2">
                                        <List className="h-3.5 w-3.5 text-brand mr-1.5 flex-shrink-0" />
                                        <p className="text-sm font-medium truncate">Categories</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tutorial?.categories?.length ? (
                                            tutorial.categories.map((e) => (
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
                                        {tutorial?.chains?.length ? (
                                            tutorial.chains.map((e) => (
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
                        </Card>
                    </div>
                </div>
            )}
        </>
    )
}
