import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@radix-ui/react-avatar'
import { List, Recycle } from 'lucide-react'

export default function TutorialSkeleton() {
    return (
        <div className="container mx-auto pt-4 pb-8 px-4">
            {/* Header section with background - exact same height */}
            <div className="mb-4 relative overflow-hidden rounded-lg h-[280px]">
                {/* Background image skeleton with exact same styling */}
                <div className="inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10"></div>
                    <div className="absolute w-full h-full blur-xs scale-[1.55] origin-center">
                        <Skeleton className="w-full h-full bg-muted/50" />
                    </div>
                </div>

                {/* Content - exact same padding and structure */}
                <div className="p-8 relative z-20 flex flex-col items-center justify-center">
                    <Avatar className="h-18 w-18">
                        <Skeleton className="h-18 w-18 rounded-full" />
                    </Avatar>
                    <Skeleton className="h-7 w-64 mt-4 mb-3" />
                    <Skeleton className="h-5 w-[80%] mb-2 mx-auto" />
                    <Skeleton className="h-5 w-[60%] mb-1 mx-auto" />
                    <Skeleton className="h-4 w-40 mt-1" />
                </div>
            </div>

            <div className="container mx-auto">
                {/* Main content card with identical padding */}
                <Card className="p-4">
                    {/* Video section with exact styling */}
                    <div className="mt-0">
                        <Card className="p-4 shadow-lg border-none bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
                            <div className="flex flex-col items-center justify-center text-center gap-4">
                                <Skeleton className="h-7 w-24 rounded-full px-3 py-1.5" />
                                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md">
                                    <Skeleton className="w-full h-full" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="border-t my-4" />

                    {/* Categories and Chains sections with identical grid layout */}
                    <div className="grid grid-cols-1 lg:flex lg:justify-between lg:px-6 gap-4 lg:gap-0">
                        {/* Categories */}
                        <div className="lg:w-1/3 lg:flex lg:flex-col lg:items-start">
                            <div className="flex items-center mb-2">
                                <List className="h-3.5 w-3.5 text-brand mr-1.5 flex-shrink-0" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-6 w-20 rounded-md gradient-background py-1" />
                                <Skeleton className="h-6 w-24 rounded-md gradient-background py-1" />
                                <Skeleton className="h-6 w-16 rounded-md gradient-background py-1" />
                            </div>
                        </div>

                        {/* Chains */}
                        <div className="col-span-2 lg:col-span-1 lg:w-1/3 lg:flex lg:flex-col lg:items-end">
                            <div className="flex items-center mb-2">
                                <Recycle className="h-3.5 w-3.5 text-brand mr-1.5 flex-shrink-0" />
                                <Skeleton className="h-4 w-14" />
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                                <Skeleton className="h-6 w-16 rounded-md gradient-background" />
                                <Skeleton className="h-6 w-20 rounded-md gradient-background" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
