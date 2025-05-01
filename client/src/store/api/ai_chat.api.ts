import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TAIQuestionRes, TAIQuestionSendInfo, TChat, TChatItemSendInfo, TChatSendInfo, TMessage, TSaveQuestionSendInfo, TTopicRes } from '@/types/ai-chat'
import { setChats, setMessages } from '../ai-chat/ai_chatSlice'

export const chatApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        chats: builder.query<TChat[], TChatSendInfo>({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/ai-chat', removeEmpty(parameters)),
                    method: 'GET'
                }
            },
            serializeQueryArgs: ({ endpointName }) => endpointName,
            merge: (currentCache, newItems, { arg: { offset } }) => {
                if (offset === 0) {
                    currentCache.length = 0
                }
                currentCache.push(...newItems)
            },
            forceRefetch: ({ currentArg, previousArg }) => JSON.stringify(currentArg) !== JSON.stringify(previousArg),
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled
                    dispatch(setChats(data))
                } catch (error) {
                    console.error('Query failed:', error)
                }
            },
            providesTags: ['Chats']
        }),

        chat: builder.query<TMessage[], string>({
            query: (id) => {
                return {
                    url: `/ai-chat/${id}/messages`,
                    method: 'GET'
                }
            },
            providesTags: ['Chat']
        }),

        createChat: builder.mutation<TChat, TChatItemSendInfo>({
            query: (params) => {
                return {
                    url: '/ai-chat',
                    method: 'POST',
                    body: params
                }
            }
        }),
        messages: builder.query<TMessage[], string>({
            query: (id) => {
                return {
                    url: `/ai-chat/${id}/messages`,
                    method: 'GET'
                }
            },
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled

                    dispatch(setMessages([...data].reverse()))
                } catch (error) {
                    console.error('Query failed:', error)
                }
            },
            providesTags: ['Chats']
        }),
        askQuestion: builder.mutation<TAIQuestionRes, TAIQuestionSendInfo>({
            query: (params) => {
                return {
                    url: '/ai-chat/ask',
                    method: 'POST',
                    body: params
                }
            }
        }),
        saveQuestion: builder.mutation<TMessage, { id: number; params: TSaveQuestionSendInfo }>({
            query: (params) => {
                return {
                    url: `/ai-chat/${params.id}/messages`,
                    method: 'POST',
                    body: params.params
                }
            }
        }),
        topics: builder.query<TChat[], null>({
            query: () => {
                return {
                    url: `/ai-chat/topics`,
                    method: 'GET'
                }
            }
        }),
        topic: builder.query<TTopicRes, string>({
            query: (id) => {
                return {
                    url: `/ai-chat/topics/${id}`,
                    method: 'GET'
                }
            },
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled

                    const userMessage: TMessage = {
                        sender: 'user',
                        message: data.title,
                        id: 0,
                        academies: []
                    }
                    const aiMessage: TMessage = {
                        sender: 'ai',
                        message: data.context,
                        id: 0,
                        academies: data.academies
                    }

                    dispatch(setMessages([userMessage, aiMessage]))
                } catch (error) {
                    console.error('Query failed:', error)
                }
            }
        }),
        deleteChat: builder.mutation<any, string>({
            query: (id) => {
                return {
                    url: `/ai-chat/${id}`,
                    method: 'DELETE'
                }
            },
            invalidatesTags: ['Chats']
        }),
        editChat: builder.mutation<any, { id: string; params: { title: string } }>({
            query: (params) => {
                return {
                    url: `/ai-chat/${params.id}`,
                    method: 'PUT',
                    body: params.params
                }
            },
            invalidatesTags: ['Chats']
        })
    }),
    overrideExisting: false
})

export const {
    useChatsQuery,
    useChatQuery,
    useCreateChatMutation,
    useMessagesQuery,
    useAskQuestionMutation,
    useSaveQuestionMutation,
    useTopicsQuery,
    useTopicQuery,
    useDeleteChatMutation,
    useEditChatMutation
} = chatApi
