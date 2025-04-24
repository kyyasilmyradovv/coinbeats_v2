import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TMyStats } from '@/types/point'

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
            forceRefetch: ({ currentArg, previousArg }) => JSON.stringify(currentArg) !== JSON.stringify(previousArg),
            providesTags: ['Points']
        }),
        history: builder.query({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/points/history', removeEmpty(parameters)),
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
            providesTags: ['PointHistory']
        }),
        myStats: builder.query<TMyStats, void>({
            query: () => ({
                url: '/points/my-stats',
                method: 'GET'
            }),
            providesTags: ['MyStats']
        })
    }),
    overrideExisting: false
})

export const { usePointsQuery, useHistoryQuery, useMyStatsQuery } = pointsApi
