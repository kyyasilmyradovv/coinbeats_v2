import { TProfile } from '@/types/user'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type SliceState = {
    profile?: TProfile
    isProfileSheetOpen: boolean
}

const initialState: SliceState = {
    isProfileSheetOpen: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setProfil(state, action: PayloadAction<TProfile | undefined>) {
            state.profile = action.payload
        },
        setIsProfilSheetOpen(state, action: PayloadAction<boolean>) {
            state.isProfileSheetOpen = action.payload
        }
    }
})

export const { setProfil, setIsProfilSheetOpen } = userSlice.actions
export default userSlice.reducer
