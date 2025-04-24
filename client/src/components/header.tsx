'use client'
import * as React from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { ThemeToggle } from './theme toggle/theme-toggle'
import { ArrowLeft, Bell } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { ROUTES } from '@/shared/links'
import { usePathname, useRouter } from 'next/navigation'
import { NavMenu } from './navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { DropdownMenuProfil } from './profileMenu'

// THIS IS A TEMPORARY HEADER FOR SIGNUP AND LANDING PAGE WHILE SITE IS NOT LIVE YET
export function Header() {
    const dispatch = useAppDispatch()
    const { theme = 'dark' } = useTheme()
    const pathname = usePathname()
    const router = useRouter()

    const imageSrc = theme === 'dark' ? '/coinbeats-light.svg' : '/coinbeats-dark.svg'

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 justify-between sticky top-0 z-50 bg-background ">
            <div className="flex items-center gap-4">
                {pathname !== ROUTES.HOME && (
                    <Link href={ROUTES.HOME} className="z-100">
                        <Button onClick={() => router.back()} variant="ghost" size="default">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                )}

                <Link href={ROUTES.HOME}>
                    <div className="relative w-[150px] h-[50px]">
                        <Image src={imageSrc} alt="Coin-Beats" fill className="object-contain" />
                    </div>
                </Link>
            </div>
            {/* </div> */}
            <div className="absolute w-full  items-center justify-center z-50 hidden md:flex">
                <NavMenu />
            </div>

            <div className="flex items-center gap-1 z-100">
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                    <Bell className="h-[1.2rem] w-[1.2rem]" />
                </Button>

                <DropdownMenuProfil />
            </div>
        </header>
    )
}
