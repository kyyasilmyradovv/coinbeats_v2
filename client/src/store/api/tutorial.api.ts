import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TTutorial, TTutorialSendInfo, TTutorialSingle } from '@/types/tutorial'

export const tutorialsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        tutorials: builder.query<TTutorial[], TTutorialSendInfo>({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/discover/tutorials', removeEmpty(parameters)),
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
            providesTags: ['Tutorials']
        }),

        tutorial: builder.query<TTutorialSingle, string>({
            query: (id) => {
                return {
                    url: `/discover/tutorials/${id}`,
                    method: 'GET'
                }
            },
            providesTags: ['Tutorial']
        })
    }),
    overrideExisting: false
})

export const { useTutorialsQuery, useTutorialQuery } = tutorialsApi
