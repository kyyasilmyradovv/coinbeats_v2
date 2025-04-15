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
