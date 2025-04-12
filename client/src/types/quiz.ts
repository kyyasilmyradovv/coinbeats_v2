export type TQuiz = {
    id: number
    question: string
    answer: string
    quizQuestion: string
    xp: number
    choices: TChoise[]
}

export type TQuizSendInfo = {
    academyId: string
}

export type TUserResponse = {
    isCorrect: boolean
    pointsAwarded: number
}
export type TChoise = { id: number; text: string; userResponses: TUserResponse[] }

export type TSubmitParams = {
    questionId: number
    choiceId: number
    secondsLeft: number
}

export type TSubmitResponse = {
    isCorrect: boolean
    pointsAwarded: number
}
