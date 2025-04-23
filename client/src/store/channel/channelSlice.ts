import { TChannelSendInfo } from '@/types/channel'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type SliceState = {
    channelSendInfo: TChannelSendInfo
}

const initialState: SliceState = {
    channelSendInfo: { offset: 0, limit: 30 }
}

export const channelSlice = createSlice({
    name: 'channel',
    initialState,
    reducers: {
        setChannelSendInfo(state, action: PayloadAction<TChannelSendInfo>) {
            state.channelSendInfo = action.payload
        }
    }
})

export const { setChannelSendInfo } = channelSlice.actions
export default channelSlice.reducer
