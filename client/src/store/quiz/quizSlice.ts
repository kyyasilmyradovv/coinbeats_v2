import { TQuiz } from '@/types/quiz'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type SliceState = {
    quizzes: TQuiz[]
}

const initialState: SliceState = {
    quizzes: []
}

export const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        setQuizzes(state, action: PayloadAction<TQuiz[]>) {
            state.quizzes = action.payload
        }
    }
})

export const { setQuizzes } = quizSlice.actions
export default quizSlice.reducer
