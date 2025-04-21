import { TEducatorSendInfo } from '@/types/educator'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type SliceState = {
    educatorSendInfo: TEducatorSendInfo
}

const initialState: SliceState = {
    educatorSendInfo: { offset: 0, limit: 30 }
}

export const educatorSlice = createSlice({
    name: 'educator',
    initialState,
    reducers: {
        setEducatorSendInfo(state, action: PayloadAction<TEducatorSendInfo>) {
            state.educatorSendInfo = action.payload
        }
    }
})

export const { setEducatorSendInfo } = educatorSlice.actions
export default educatorSlice.reducer
