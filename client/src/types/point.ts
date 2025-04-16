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

export type TPointHistory = {
    value: number
    description: string
    createdAt: string
    academy?: {
        name: string
        logoUrl: string
    }
    verificationTask?: {
        name: string
    }
}
