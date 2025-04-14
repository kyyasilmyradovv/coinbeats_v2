import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

export function AcademyHeaderSkeleton() {
    return (
        <div className="mb-4 relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-800 to-gray-900">
            <div className="p-8 relative z-20 flex flex-col items-center justify-center">
                <Skeleton className="h-[72px] w-[72px] rounded-full" />
                <Skeleton className="h-10 w-48 mt-1 mb-3" />
                <div className="flex w-full items-center justify-center gap-12">
                    <Skeleton className="h-[28px] w-24 rounded-full" />
                    <Skeleton className="h-[28px] w-24 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export function AcademyTabsSkeleton() {
    return (
        <section className="mb-4">
            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-4 h-10">
                    <TabsTrigger value="general">GENERAL</TabsTrigger>
                    <TabsTrigger value="quiz" disabled>
                        QUIZ
                    </TabsTrigger>
                    <TabsTrigger value="tutorial" disabled>
                        TUTORIAL
                    </TabsTrigger>
                    <TabsTrigger value="quests" disabled>
                        QUESTS
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="mt-2">
                    <div className="container mx-auto">
                        {/* Project details card */}
                        <Card className="p-4">
                            <div className="grid grid-cols-2 lg:flex lg:justify-between lg:px-6 gap-4 lg:gap-0">
                                {/* Ticker */}
                                <div className="lg:w-1/3">
                                    <div className="flex items-center mb-2">
                                        <Skeleton className="h-3.5 w-3.5 mr-1.5" />
                                        <Skeleton className="h-[18px] w-16" />
                                    </div>
                                    <Skeleton className="h-[28px] w-20 rounded-md" />
                                </div>

                                {/* Categories */}
                                <div className="lg:w-1/3 lg:flex lg:flex-col lg:items-center">
                                    <div className="flex items-center mb-2">
                                        <Skeleton className="h-3.5 w-3.5 mr-1.5" />
                                        <Skeleton className="h-[18px] w-20" />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Skeleton className="h-[28px] w-20 rounded-md" />
                                        <Skeleton className="h-[28px] w-24 rounded-md" />
                                    </div>
                                </div>

                                {/* Chains */}
                                <div className="col-span-2 lg:col-span-1 lg:w-1/3 lg:flex lg:flex-col lg:items-end">
                                    <div className="flex items-center mb-2">
                                        <Skeleton className="h-3.5 w-3.5 mr-1.5" />
                                        <Skeleton className="h-[18px] w-16" />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Skeleton className="h-[28px] w-20 rounded-md" />
                                        <Skeleton className="h-[28px] w-16 rounded-md" />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t my-4"></div>

                            {/* Social Links */}
                            <div className="flex flex-col items-center">
                                <Skeleton className="h-[18px] w-40 mb-3" />
                                <div className="flex items-center justify-center gap-5">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Trade button - */}
                    <div className="w-full flex items-center justify-center mt-6 mb-4">
                        <Skeleton className="h-10 w-36 rounded-md" />
                    </div>

                    {/* Content skeleton */}
                    <AcademyContentSkeleton />

                    {/* Earned coins skeleton */}
                    <EarnedCoinsSkeleton />
                </TabsContent>
            </Tabs>
        </section>
    )
}

export function AcademyContentSkeleton() {
    return (
        <div className="mt-4 mb-6">
            <Card className="p-4">
                <div className="space-y-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className={item > 1 ? 'pt-4 border-t' : ''}>
                            <Skeleton className="h-5 w-1/3 mb-3" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

export function EarnedCoinsSkeleton() {
    return (
        <div className="h-full gap-1 flex flex-col flex-1">
            <Card className="px-3 py-2 flex-1 flex flex-row items-center justify-between">
                {/* Match Lottie animation size exactly */}
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-[14px] md:h-[18px] w-1/2" />
                {/* Match button height */}
                <Skeleton className="h-8 w-28 rounded-md" />
            </Card>
        </div>
    )
}

export function AcademySkeleton() {
    return (
        <div className="container mx-auto pt-4 pb-8 px-4 select-none">
            <AcademyHeaderSkeleton />
            <AcademyTabsSkeleton />
        </div>
    )
}
