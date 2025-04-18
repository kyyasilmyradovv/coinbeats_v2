import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
export type TSteps = 1 | 2 | 3

type SliceState = {
    loginModalOpen: boolean
    signUpModalOpen: boolean
    step: TSteps
    newMail?: string
}

const initialState: SliceState = {
    loginModalOpen: false,
    signUpModalOpen: false,
    step: 1
}

export const generalSlice = createSlice({
    name: 'general',
    initialState,
    reducers: {
        setLoginModalOpen(state, action: PayloadAction<boolean>) {
            state.loginModalOpen = action.payload
        },
        setSignUpModalOpen(state, action: PayloadAction<boolean>) {
            state.signUpModalOpen = action.payload
        },
        setStep(state, action: PayloadAction<TSteps>) {
            state.step = action.payload
        },
        setNewMail(state, action: PayloadAction<string>) {
            state.newMail = action.payload
        }
    }
})

export const { setLoginModalOpen, setSignUpModalOpen, setStep, setNewMail } = generalSlice.actions
export default generalSlice.reducer
