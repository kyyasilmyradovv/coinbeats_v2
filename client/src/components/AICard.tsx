import React from 'react'
import { Card, CardFooter, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from './ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'
import AIAnimationData from '@/animations/AI.json'
import { ROUTES } from '@/shared/links'
const Lottie = dynamic(() => import('react-lottie'), { ssr: false })

export interface AICardProps {}

function AICard({}: AICardProps) {
    const { theme = 'dark' } = useTheme()

    const imageSrc = theme === 'dark' ? '/coinbeats-light.svg' : '/coinbeats-dark.svg'

    const AIAnimation = {
        loop: true,
        autoplay: true,
        animationData: AIAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }
    return (
        <Card className={cn('rounded-3xl backdrop-blur-lg shadow-xl transition hover:scale-[1.015] hover:shadow-2xl', 'flex flex-col duration-300')}>
            <CardContent className="mt-4 px-6 text-center flex flex-col gap-3 items-center">
                <div className="relative ">
                    <Lottie options={AIAnimation} height={100} width={100} />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Your first steps into crypto</CardTitle>
            </CardContent>

            <CardFooter className="mt-auto px-2 py-4 flex justify-center w-full">
                <Link href={ROUTES.HOME} passHref className="w-full">
                    <Button variant="outline" className="rounded-full px-6  border-brand cursor-pointer w-full background-brand font-bold">
                        LEARN WITH AI
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}

export default AICard
