export type TPoint = {
    id: any
    name: string
    pointCount: string
    lastWeekPointCount: string
}

export type TPointSendInfo = {
    period: 'weekly' | 'overall'
    offset: number
    limit: number
}
export type TMyStats = {
    raffleAmount: number
    pointCount: number
    lastWeekPointCount: number
    rankOverall: number
    rankLastWeek: number
}
