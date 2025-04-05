export type TAcademy = {
    id: number
    name: string
    logoUrl: string
    xp: number
    pointCount: number
    fomoNumber: number
    fomoXp: number
    academyTypeId: number
}

export type TAcademySendInfo = {
    offset: number
    limit: number
    keyword?: string
    categoryId?: number
    chainId?: number
}

export type TAcademySingle = {
    id: number
    coingecko: string
    coverPhotoUrl: string
    dexScreener: string
    discord: string
    fomoNumber: number
    fomoXp: number
    logoUrl: string
    name: string
    overallRaffle?: any
    pointCount: string
    telegram: string
    ticker: string
    tokenomics: any
    twitter: string
    webpageUrl: string
    xp: number
}
