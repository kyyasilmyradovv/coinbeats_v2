import { TTutorialSendInfo } from '@/types/tutorial'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type SliceState = {
    tutorialSendInfo: TTutorialSendInfo
}

const initialState: SliceState = {
    tutorialSendInfo: { offset: 0, limit: 30 }
}

export const tutorialSlice = createSlice({
    name: 'tutorial',
    initialState,
    reducers: {
        setTutorialSendInfo(state, action: PayloadAction<TTutorialSendInfo>) {
            state.tutorialSendInfo = action.payload
        }
    }
})

export const { setTutorialSendInfo } = tutorialSlice.actions
export default tutorialSlice.reducer
