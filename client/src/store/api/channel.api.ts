import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TChannel, TChannelSendInfo, TChannelSingle } from '@/types/channel'

export const channelsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        channels: builder.query<TChannel[], TChannelSendInfo>({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/discover/channels', removeEmpty(parameters)),
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
            providesTags: ['Channels']
        }),

        channel: builder.query<TChannelSingle, string>({
            query: (id) => {
                return {
                    url: `/discover/channels/${id}`,
                    method: 'GET'
                }
            },
            providesTags: ['Channel']
        })
    }),
    overrideExisting: false
})

export const { useChannelsQuery, useChannelQuery } = channelsApi
