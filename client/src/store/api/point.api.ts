import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'

export const pointsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        points: builder.query({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/points/leaderboard', removeEmpty(parameters)),
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
            providesTags: ['Points']
        })
    }),
    overrideExisting: false
})

export const { usePointsQuery } = pointsApi
