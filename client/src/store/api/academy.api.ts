import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TAcademySingle } from '@/types/academy'

export const academiesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        academies: builder.query({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/academies', removeEmpty(parameters)),
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
            providesTags: ['Academies']
        }),
        academy: builder.query<TAcademySingle, string>({
            query: (id) => {
                return {
                    url: `/academies/${id}`,
                    method: 'GET'
                }
            },
            providesTags: ['Academy']
        }),
        academyContent: builder.query({
            query: (id) => `/academies/${id}/content`,
            providesTags: (result, error, id) => [{ type: 'Academy', id }]
        })
    }),
    overrideExisting: false
})

export const { useAcademiesQuery, useAcademyQuery, useAcademyContentQuery } = academiesApi
