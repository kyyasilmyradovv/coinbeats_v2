import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function AcademyContentSkeleton() {
    return (
        <div className="mt-4 mb-6">
            <Skeleton className="h-6 w-48 mb-4" />
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
