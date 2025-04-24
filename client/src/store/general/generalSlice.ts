import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
export type TSteps = 1 | 2 | 3

type SliceState = {
    loginModalOpen: boolean
    signUpModalOpen: boolean
    step: TSteps
    newMail?: string
    discoverMenuValue: string
}

const initialState: SliceState = {
    loginModalOpen: false,
    signUpModalOpen: false,
    step: 1,
    discoverMenuValue: 'educators'
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
        },
        setDiscoverMenuValue(state, action: PayloadAction<string>) {
            state.discoverMenuValue = action.payload
        }
    }
})

export const { setLoginModalOpen, setSignUpModalOpen, setStep, setNewMail, setDiscoverMenuValue } = generalSlice.actions
export default generalSlice.reducer
