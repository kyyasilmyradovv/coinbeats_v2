import React, { ReactNode } from 'react'
import { Card, CardHeader, CardFooter, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { cn, constructImageUrl } from '@/lib/utils'
import { Button } from './ui/button'
import { BellRing, Bookmark, Check, CheckCheck, Flag, Save, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import Link from 'next/link'
import { ROUTES } from '@/shared/links'
import { TAcademy } from '@/types/academy'

export interface AcademyCardProps {
    academy: TAcademy
}

function AcademyCard({ academy }: AcademyCardProps) {
    return (
        <div className="flex flex-col relative rounded-lg mb-4">
            <Card className="h-full flex flex-col py-4 gradient-border ">
                <CardHeader className=" flex items-center  justify-between px-4 align-middle">
                    <Bookmark className="h-4 w-4 transition-transform duration-300 transform hover:scale-110 text-amber-500" />

                    <Badge variant="outline" className="flex items-center ">
                        <span>+{academy.pointCount > academy.fomoNumber ? academy.xp : academy.fomoXp}</span>
                        <Check className="h-5.5 w-5.5" />
                    </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-center flex-col gap-3">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={constructImageUrl(academy.logoUrl)} alt="Clearpool" className="w-full h-full object-cover" />
                        <AvatarFallback className="text-xl">Cl</AvatarFallback>
                    </Avatar>

                    <p className="text-lg font-medium leading-none">{academy.name}</p>
                </CardContent>
                <CardFooter className="flex align-middle justify-end px-4">
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{academy.pointCount}</span>
                    </Badge>
                    <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/4 flex items-center justify-center px-4 ">
                        <Link href={ROUTES.getAcademyDetails(academy.id)} key={academy.id} className="block">
                            <Button
                                variant="outline"
                                className="text-brand hover:-translate-y-1.5 hover:bg-brand-500 transition-all duration-150 bg-background card-buy-button border-brand cursor-pointer"
                            >
                                Study Now
                            </Button>
                        </Link>

                        <div></div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default AcademyCard
