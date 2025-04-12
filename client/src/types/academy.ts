import { TCategory } from './category'
import { TChain } from './chain'

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
export type TRaffle = { id: number; minAmount: number; winnersCount: number; deadline: string; minPoints: number; reward: string }

export type TGlobal = {
    id: number
    name: string
}

export type TAcademySingle = {
    [key: string]: any
    id: number
    name: string
    ticker: string
    coingecko: string
    discord: string
    telegram: string
    twitter: string
    webpageUrl: string
    coverPhotoUrl: string
    logoUrl: string
    dexScreener: string
    xp: number
    pointCount: number
    fomoNumber: number
    fomoXp: number
    raffles: TRaffle[]
    categories: TCategory[]
    chains: TChain[]
    academyType: TGlobal
    points?: { value: number }[]
}
