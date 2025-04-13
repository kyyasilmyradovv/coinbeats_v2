import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TCounterSendInfo } from '@/types/counter'

export const counterApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        counter: builder.query({
            query: (parameters: TCounterSendInfo) => {
                return {
                    url: buildUrlWithParams('/counter', removeEmpty(parameters)),
                    method: 'GET'
                }
            },

            providesTags: ['Counter']
        })
    }),
    overrideExisting: false
})

export const { useCounterQuery } = counterApi
