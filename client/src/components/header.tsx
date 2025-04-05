'use client'
import * as React from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { ThemeToggle } from './theme toggle/theme-toggle'
import { AlertCircle, ArrowBigLeft, Bell, BellRing, Coins } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { ROUTES } from '@/shared/links'
import { usePathname, useRouter } from 'next/navigation'
import { NavMenu } from './navigation'

// THIS IS A TEMPORARY HEADER FOR SIGNUP AND LANDING PAGE WHILE SITE IS NOT LIVE YET
export function Header() {
    const { theme = 'dark' } = useTheme()
    const pathname = usePathname()
    const router = useRouter()

    const imageSrc = theme === 'dark' ? '/coinbeats-light.svg' : '/coinbeats-dark.svg'

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 justify-between sticky top-0 z-10 bg-background ">
            {/* {pathname === ROUTES.HOME ? (
        <Link href={ROUTES.COINS} className="z-100">
          <Button variant="outline" size="icon">
            <Coins className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Link href={ROUTES.HOME} className="z-100">
          <Button onClick={() => router.back()} variant="ghost" size="default">
            <ArrowBigLeft className="h-4 w-4" />
            <p className="hidden md:flex">Back</p>
          </Button>
        </Link>
      )} */}

            {/* <div className="absolute w-full flex items-center justify-center z-50"> */}
            <Link href={ROUTES.HOME}>
                <div className="relative w-[150px] h-[50px]">
                    <Image src={imageSrc} alt="Coin-Beats" fill className="object-contain" />
                </div>
            </Link>
            {/* </div> */}
            <div className="absolute w-full  items-center justify-center z-50 hidden md:flex">
                <NavMenu />
            </div>

            <div className="flex items-center gap-1 z-100">
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                    <Bell className="h-[1.2rem] w-[1.2rem]" />
                </Button>
                <div className=" flex items-center space-x-4  p-1 justify-center">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback className="p-2">DG</AvatarFallback>
                    </Avatar>
                    {/* <div className="flex-1 space-y-1 hidden md:block">
                        <p className="text-sm font-medium leading-none">Didar Gayypow</p>
                        <p className="text-sm text-muted-foreground">@didar_gayypow</p>
                    </div> */}
                </div>
            </div>
        </header>
    )
}
