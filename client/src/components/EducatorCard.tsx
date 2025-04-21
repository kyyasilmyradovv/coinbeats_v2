import React from 'react'
import { Card, CardHeader, CardFooter, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { TEducator } from '@/types/educator'
import Link from 'next/link'
import { ROUTES } from '@/shared/links'
import { BookOpen, Layers, Link2 } from 'lucide-react'
import { cn, constructImageUrl } from '@/lib/utils'

// Fallback images

export interface EducatorCardProps {
    educator: TEducator
}

function EducatorCard({ educator }: EducatorCardProps) {
    return (
        <Card
            className={cn(
                'relative overflow-hidden rounded-3xl backdrop-blur-lg shadow-xl transition hover:scale-[1.015] hover:shadow-2xl',
                'flex flex-col min-h-[420px] duration-300'
            )}
        >
            {/* Cover */}
            <div className="relative h-36 w-full">
                <img src={constructImageUrl(educator.coverPhotoUrl)} alt="cover" className="w-full h-full object-cover" />
                {/* Avatar */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <Avatar className="h-20 w-20 border-[4px] ">
                        <AvatarImage src={constructImageUrl(educator.avatarUrl)} alt={educator.name} />
                        <AvatarFallback className="text-xl font-semibold">{educator.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Content */}
            <CardContent className="mt-14 px-6 text-center flex flex-col gap-3">
                <CardTitle className="text-xl font-bold text-foreground">{educator.name}</CardTitle>
                <CardDescription className="text-muted-foreground text-sm truncate">
                    {educator.bio || 'This educator has not provided a bio yet.'}
                </CardDescription>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground pt-2">
                    <div className="flex flex-col items-center">
                        <BookOpen className="h-4 w-4 mb-1" />
                        <span>{educator._count.lessons}</span>
                        <span>Lessons</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Link2 className="h-4 w-4 mb-1" />
                        <span>{educator._count.chains} </span>
                        <span>Chains</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Layers className="h-4 w-4 mb-1" />
                        <span>{educator._count.categories}</span>
                        <span>Categories</span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {educator.categories.map((cat) => (
                        <Badge key={cat.id} variant="secondary" className="text-xs px-2 py-1 rounded-xl">
                            {cat.name}
                        </Badge>
                    ))}
                    {educator.chains.map((chain) => (
                        <Badge key={chain.id} variant="outline" className="text-xs px-2 py-1 rounded-xl">
                            {chain.name}
                        </Badge>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="mt-auto px-6 py-4 flex justify-center">
                <Link href={ROUTES.getEducatorDetails(educator.id)} passHref>
                    <Button variant="outline" className="rounded-full px-6  border-brand cursor-pointer">
                        View
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}

export default EducatorCard
