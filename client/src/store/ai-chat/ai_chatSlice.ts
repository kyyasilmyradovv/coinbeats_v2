import { TAcademySendInfo } from '@/types/academy'
import { TChat, TChatSendInfo, TMessage } from '@/types/ai-chat'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type SliceState = {
    prompt: string
    chatSendInfo: TChatSendInfo
    chats: TChat[]
    messages: TMessage[]
    isNewChat: boolean
}

const initialState: SliceState = {
    prompt: '',
    chatSendInfo: {
        offset: 0,
        limit: 30
    },
    chats: [],
    messages: [],
    isNewChat: false
}

export const ai_chatSlice = createSlice({
    name: 'ai_chat',
    initialState,
    reducers: {
        setPrompt(state, action: PayloadAction<string>) {
            state.prompt = action.payload
        },
        setChatSendInfo(state, action: PayloadAction<TChatSendInfo>) {
            state.chatSendInfo = action.payload
        },
        setChats(state, action: PayloadAction<TChat[]>) {
            state.chats = action.payload
        },
        setMessages(state, action: PayloadAction<TMessage[]>) {
            state.messages = action.payload
        },
        setIsNewChat(state, action: PayloadAction<boolean>) {
            state.isNewChat = action.payload
        }
    }
})

export const { setPrompt, setChatSendInfo, setMessages, setChats, setIsNewChat } = ai_chatSlice.actions
export default ai_chatSlice.reducer
