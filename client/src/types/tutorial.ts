import { TCategory } from './category'
import { TChain } from './chain'

type TCount = {
    lessons: number
    chains: number
    categories: number
}

export type TTutorial = {
    id: number
    title: string
    description: string
    coverPhotoUrl: string
    logoUrl: string
    chains: TChain[]
    categories: TCategory[]
    _count: TCount
}

export type TTutorialSendInfo = {
    offset: number
    limit: number
    keyword?: string
    categoryId?: number
    chainId?: number
}

export type TTutorialSingle = {
    id: number
    title: string
    contentUrl: string
    xp: number
    type: string
    coverPhotoUrl: string
    description: string
    logoUrl: string
    contentOrigin: string
    createdAt: string
    updatedAt: string
    visitCount: number
    chains: TChain
    categories: TCategory[]
    _count: TCount
}
