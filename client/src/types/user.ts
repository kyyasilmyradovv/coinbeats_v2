export type TProfile = {
    id: number
    email: string
    name: string
    roles: string[]
    telegramUserId: string | number
}
export type TTokens = {
    accessToken: string
    refreshToken: string
}
