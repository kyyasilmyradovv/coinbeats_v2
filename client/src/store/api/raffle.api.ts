import { apiSlice } from './apiSlice'

export const rafflesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        raffles: builder.query({
            query: () => {
                return {
                    url: '/raffles/overall',
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
            providesTags: ['Raffles']
        })
    }),
    overrideExisting: false
})

export const { useRafflesQuery } = rafflesApi
