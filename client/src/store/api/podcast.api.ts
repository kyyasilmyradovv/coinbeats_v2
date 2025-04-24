import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TPodcast, TPodcastSendInfo, TPodcastSingle } from '@/types/podcast'

export const podcastsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        podcasts: builder.query<TPodcast[], TPodcastSendInfo>({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/discover/podcasts', removeEmpty(parameters)),
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
            providesTags: ['Podcasts']
        }),

        podcast: builder.query<TPodcastSingle, string>({
            query: (id) => {
                return {
                    url: `/discover/podcasts/${id}`,
                    method: 'GET'
                }
            },
            providesTags: ['Podcast']
        })
    }),
    overrideExisting: false
})

export const { usePodcastsQuery, usePodcastQuery } = podcastsApi
