import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { cn, constructImageUrl } from '@/lib/utils'
import { Calendar, Gift, Ticket, Trophy, Clock } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'

export type TRaffle = {
    name: string
    logoUrl: string
    deadline: string
    reward: string
    winnersCount: number
    yourRaffleCount?: number
    type: 'PLATFORM' | 'ACADEMY'
}

export interface RaffleCardProps {
    raffle: TRaffle
}

// Helper function to format time remaining
const formatTimeRemaining = (milliseconds: number) => {
    if (milliseconds <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }

    const seconds = Math.floor((milliseconds / 1000) % 60)
    const minutes = Math.floor((milliseconds / 1000 / 60) % 60)
    const hours = Math.floor((milliseconds / 1000 / 60 / 60) % 24)
    const days = Math.floor(milliseconds / 1000 / 60 / 60 / 24)

    return { days, hours, minutes, seconds, isExpired: false }
}

function RaffleCard({ raffle }: RaffleCardProps) {
    const [timeRemaining, setTimeRemaining] = useState<{
        days: number
        hours: number
        minutes: number
        seconds: number
        isExpired: boolean
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false })

    // Live countdown effect
    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date()
            const deadlineDate = new Date(raffle.deadline)
            const timeDifference = deadlineDate.getTime() - now.getTime()
            setTimeRemaining(formatTimeRemaining(timeDifference))
        }

        calculateTimeRemaining()

        const interval = setInterval(calculateTimeRemaining, 1000)

        // Clean up interval on component unmount
        return () => clearInterval(interval)
    }, [raffle.deadline])

    const isDeadlineSoon = () => {
        const deadline = new Date(raffle.deadline)
        const now = new Date()
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays <= 3
    }

    return (
        <div className="flex flex-col relative rounded-lg mb-4">
            <Card className="h-full flex flex-col py-4 gradient-border">
                <CardHeader className="flex items-center justify-between px-4 align-middle">
                    <Badge variant="outline" className="flex items-center">
                        {raffle.type === 'PLATFORM' ? 'Platform' : 'Academy'}
                    </Badge>

                    <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(raffle.deadline).toLocaleDateString()}</span>
                    </Badge>
                </CardHeader>

                <CardContent className="flex items-center justify-center flex-col gap-3">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={constructImageUrl(raffle.logoUrl || 'uploads/logo-1727159677507.jpg')} alt={raffle.name} />
                    </Avatar>

                    <CardTitle className="text-lg font-medium">{raffle.name || 'Coinbeats Platform'}</CardTitle>

                    {/* Countdown timer */}
                    <div className={cn('w-full rounded-md p-2 my-1', isDeadlineSoon() ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-muted/30')}>
                        <div className="flex items-center gap-1.5 justify-center text-sm">
                            <Clock className="h-3.5 w-3.5text-muted-foreground" />
                            {timeRemaining.isExpired ? (
                                <span className="text-destructive font-medium">Expired</span>
                            ) : (
                                <div className="flex gap-1 items-center">
                                    <span className="font-medium">
                                        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
                                        {timeRemaining.hours > 0 && `${timeRemaining.hours}h `}
                                        {timeRemaining.minutes > 0 && `${timeRemaining.minutes}m `}
                                        <span>{timeRemaining.seconds}s</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full mt-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Gift className="h-4 w-4" />
                                <span>Reward:</span>
                            </div>
                            <span className="font-medium">{raffle.reward}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Trophy className="h-4 w-4" />
                                <span>Winners:</span>
                            </div>
                            <span className="font-medium">{raffle.winnersCount}</span>
                        </div>

                        {raffle.yourRaffleCount !== undefined && (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Ticket className="h-4 w-4" />
                                    <span>Your entries:</span>
                                </div>
                                <span className="font-medium">{raffle.yourRaffleCount || 0}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default RaffleCard
