export interface VerificationTask {
    id: number
    name: string
    description: string
    xp: number
    platform: string
    verificationMethod: string
    intervalType: string
    shortCircuit: boolean
    shortCircuitTimer: number | null
    parameters?: { [key: string]: any }
    repeatInterval?: number
}

export interface QuestTabProps {
    academy: any
}
