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
    streaming?: boolean
}

export type TChatItemSendInfo = {
    title?: string
    prompt: string
}

export type TSender = 'user' | 'ai'

export type TAIQuestionSendInfo = {
    prompt: string
    addresses?: []
    messages?: []
    chainId?: string
}

export type TAIQuestionRes = {
    result: { answer: string }
}
