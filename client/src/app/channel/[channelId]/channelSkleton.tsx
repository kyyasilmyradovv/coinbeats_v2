import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { List, Recycle } from 'lucide-react'

export default function ChannelSkeleton() {
    return (
        <div className="container mx-auto pt-4 pb-8 px-4">
            {/* Banner section */}
            <div className="mb-4 relative overflow-hidden rounded-lg h-[320px]">
                <div className="absolute inset-0 z-10 bg-black/60"></div>
                <Skeleton className="absolute w-full h-full z-0" />
                <div className="p-8 relative z-20 flex flex-col items-center justify-center h-full">
                    <Skeleton className="h-20 w-20 rounded-full mb-4" />
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-72 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            {/* Info card */}
            <Card className="p-4">
                <div className="grid grid-cols-1 lg:flex lg:justify-between lg:px-6 gap-4 lg:gap-0">
                    {/* Categories */}
                    <div className="lg:w-1/3">
                        <div className="flex items-center mb-2">
                            <List className="h-3.5 w-3.5 text-muted mr-1.5" />
                            <p className="text-sm font-medium truncate">Categories</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-6 w-20 rounded-full" />
                            ))}
                        </div>
                    </div>

                    {/* Chains */}
                    <div className="lg:w-1/3">
                        <div className="flex items-center mb-2">
                            <Recycle className="h-3.5 w-3.5 text-muted mr-1.5" />
                            <p className="text-sm font-medium truncate">Chains</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <Skeleton key={i} className="h-6 w-20 rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t my-4" />

                {/* Socials */}
                <div className="flex flex-col items-center">
                    <p className="text-sm font-medium text-center mb-2">Connect with the Project</p>
                    <div className="flex items-center gap-5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-6 w-6 rounded-full" />
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    )
}
