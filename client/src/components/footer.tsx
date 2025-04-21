'use client'
import * as React from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { NAV_ITEMS } from '@/shared/links'
import { usePathname } from 'next/navigation'
import { Award, Compass, Gift, GraduationCap, Star } from 'lucide-react'

export function Footer() {
    const pathname = usePathname()
    return (
        <div className="left-0 bottom-0 h-20 border-t fixed w-full bg-background flex items-center justify-between md:justify-around  md:gap-4 md:px-2 md:hidden">
            {NAV_ITEMS.map((item) => (
                <Link href={item.href} key={item.label} scroll={false} className="flex-1">
                    <Button
                        size={'icon'}
                        className={`w-full bg-background cursor-pointer ${pathname === item.href ? 'border-brand' : ''}  flex h-fit px-0.5  py-1`}
                        variant="outline"
                    >
                        {item.label === 'Protocols' && <GraduationCap className={`w-6 h-6 text-foreground `} />}
                        {item.label === 'Learn' && <Compass className={`w-6 h-6 text-foreground `} />}
                        {item.label === 'Raffles' && <Gift className={`w-6 h-6 text-foreground `} />}
                        {item.label === 'Earn' && <Star className={`w-6 h-6 text-foreground `} />}
                        {item.label === 'Points' && <Award className={`w-6 h-6 text-foreground `} />}
                        <p className="truncate text-xs"> {item.label}</p>
                    </Button>
                </Link>
            ))}
        </div>
    )
}
