import { TCategory } from './category'
import { TChain } from './chain'

type TCount = {
    lessons: number
    chains: number
    categories: number
}

export type TPodcast = {
    id: number
    name: string
    description: string
    coverPhotoUrl: string
    logoUrl: string
    chains: TChain[]
    categories: TCategory[]
    _count: TCount
}

export type TPodcastSendInfo = {
    offset: number
    limit: number
    keyword?: string
    categoryId?: number
    chainId?: number
}

export type TPodcastSingle = {
    [key: string]: any
    id: number
    name: string
    bio: string
    avatarUrl: string
    youtubeUrl: string
    twitterUrl: string
    telegramUrl: string
    discordUrl: string
    coverPhotoUrl: string
    logoUrl: string
    contentOrigin: string
    createdAt: string
    updatedAt: string
    webpageUrl: string
    substackUrl: string
    visitCount: number
    chains: TChain[]
    categories: TCategory[]
    lessons: any
    _count: TCount
}
