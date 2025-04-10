import { TProfile } from '@/types/user'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type SliceState = {
    profile?: TProfile
}

const initialState: SliceState = {}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setProfil(state, action: PayloadAction<TProfile>) {
            state.profile = action.payload
        }
    }
})

export const { setProfil } = userSlice.actions
export default userSlice.reducer
