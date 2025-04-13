'use client'
import RaffleCard from '@/components/raffleCard'
import { useRafflesQuery } from '@/store/api/raffle.api'
import { TRaffle } from '@/types/raffle'

export default function Raffles() {
    const { currentData: raffles, isLoading, isFetching } = useRafflesQuery(null)

    return (
        <div className="container mx-auto pt-4 pb-8 px-4">
            {!raffles?.length && (isLoading || isFetching) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
                    {/* {Array.from({ length: 10 }).map((_, index) => (
                        <AnalysisCardSkeleton key={index} />
                    ))} */}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 ">
                    {raffles?.map((raffle: TRaffle) => (
                        <RaffleCard raffle={raffle} />
                    ))}
                </div>
            )}
        </div>
    )
}

// // Skeleton component for loading state
// function RafflesCardSkeleton() {
//     return (
//         <div className="flex flex-col relative rounded-lg mb-4">
//             <Card className="h-full flex flex-col py-4 gradient-border">
//                 <CardHeader className="flex items-center justify-between px-4">
//                     <Skeleton className="h-4 w-4 rounded" />
//                     <Skeleton className="h-5 w-12 rounded" />
//                 </CardHeader>

//                 <CardContent className="flex flex-col items-center gap-3">
//                     <Skeleton className="h-16 w-16 rounded-full" />
//                     <Skeleton className="h-5 w-24" />
//                 </CardContent>

//                 <CardFooter className="flex justify-end px-4 relative">
//                     <Skeleton className="h-5 w-12 rounded" />
//                     <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/4 flex items-center justify-center -mb-4">
//                         <Skeleton className="h-10 w-24 rounded-md " />
//                     </div>
//                 </CardFooter>
//             </Card>
//         </div>
//     )
// }
