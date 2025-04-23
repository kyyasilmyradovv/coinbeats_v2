import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TEducator, TEducatorSendInfo, TEducatorSingle } from '@/types/educator'

export const educatorsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        educators: builder.query<TEducator[], TEducatorSendInfo>({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/discover/educators', removeEmpty(parameters)),
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
            forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
            providesTags: ['Educators']
        }),

        educator: builder.query<TEducatorSingle, string>({
            query: (id) => {
                return {
                    url: `/discover/educators/${id}`,
                    method: 'GET'
                }
            },
            providesTags: ['Educator']
        })
    }),
    overrideExisting: false
})

export const { useEducatorsQuery, useEducatorQuery } = educatorsApi
