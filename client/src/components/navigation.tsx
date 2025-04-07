'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { NAV_ITEMS } from '@/shared/links'

// Import necessary icons from lucide-react
import { GraduationCap, Compass, Gift, Star, Award } from 'lucide-react'

export function NavMenu() {
    const { theme } = useTheme()
    const pathname = usePathname()

    // Determine colors based on the theme
    const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
    const hoverBgColor = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
    const activeBgColor = theme === 'dark' ? 'bg-gray-700 ' : 'bg-gray-300 '

    return (
        <NavigationMenu className="relative">
            <NavigationMenuList className="flex space-x-2">
                {NAV_ITEMS.map((item, i) => {
                    let isActive = pathname === item.href
                    if (pathname.split('/')[1] === 'academy' && item.href === '/') {
                        isActive = true
                    }

                    return (
                        <NavigationMenuItem key={i} className="relative">
                            <Link href={item.href} passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        navigationMenuTriggerStyle(),
                                        'flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200',
                                        isActive ? activeBgColor : hoverBgColor,
                                        textColor
                                    )}
                                >
                                    {/* Icon from lucide-react */}
                                    <div className="flex items-center gap-1.5 transition-all duration-200 hover:scale-110">
                                        {item.label === 'Protocols' && <GraduationCap className={`w-6 h-6 text-foreground `} />}
                                        {item.label === 'Learn' && <Compass className={`w-6 h-6 text-foreground `} />}
                                        {item.label === 'Raffles' && <Gift className={`w-6 h-6 text-foreground `} />}
                                        {item.label === 'Earn' && <Star className={`w-6 h-6 text-foreground `} />}
                                        {item.label === 'Points' && <Award className={`w-6 h-6 text-foreground `} />}

                                        <p className={cn('text-sm font-medium', isActive ? 'text-brand-500' : '')}>{item.label}</p>
                                    </div>
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    )
                })}
            </NavigationMenuList>
        </NavigationMenu>
    )
}
