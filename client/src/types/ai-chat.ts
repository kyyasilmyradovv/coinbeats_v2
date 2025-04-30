import { TAcademy } from './academy'

export type TChat = {
    id: number
    title: string
}

export type TChatSendInfo = {
    offset: number
    limit: number
    keyword?: string
}

export type TMessage = {
    id: number
    message: string
    sender: TSender
    academies: TAcademy[]
}

export type TChatItemSendInfo = {
    title?: string
    prompt: string
}

export type TSender = 'user' | 'ai'
