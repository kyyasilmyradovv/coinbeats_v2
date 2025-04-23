import { TPodcastSendInfo } from '@/types/podcast'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type SliceState = {
    podcastSendInfo: TPodcastSendInfo
}

const initialState: SliceState = {
    podcastSendInfo: { offset: 0, limit: 30 }
}

export const podcastSlice = createSlice({
    name: 'podcast',
    initialState,
    reducers: {
        setPodcastSendInfo(state, action: PayloadAction<TPodcastSendInfo>) {
            state.podcastSendInfo = action.payload
        }
    }
})

export const { setPodcastSendInfo } = podcastSlice.actions
export default podcastSlice.reducer
