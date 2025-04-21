import { TCategory } from './category'
import { TChain } from './chain'

type TCount = {
    lessons: number
    chains: number
    categories: number
}

export type TChannel = {
    id: number
    name: string
    description: string
    coverPhotoUrl: string
    logoUrl: string
    chains: TChain[]
    categories: TCategory[]
    _count: TCount
}

export type TChannelSendInfo = {
    offset: number
    limit: number
    keyword?: string
    categoryId?: number
    chainId?: number
}

export type TChannelSingle = {
    id: number
    name: string
    description: string
    youtubeUrl: string
    coverPhotoUrl: string
    logoUrl: string
    contentOrigin: string
    createdAt: string
    updatedAt: string
    visitCount: number
    chains: TChain
    categories: TCategory
    _count: TCount
}
