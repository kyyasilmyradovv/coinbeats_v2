import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TAcademy } from '@/types/academy'

export const categoriesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        categoryOptions: builder.query({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/categories', removeEmpty(parameters)),
                    method: 'GET'
                }
            },
            transformResponse: async (baseQueryReturnValue, _meta, _arg) => {
                let result =
                    (baseQueryReturnValue as TAcademy[])?.map((e) => ({
                        label: e.name,
                        value: e.id.toString()
                    })) || []

                return result
            },
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const { offset, limit, ...rest } = queryArgs || {}
                return JSON.stringify({ endpointName, ...rest })
            },
            merge: (currentCache, newItems, { arg: { offset } }) => {
                if (offset === 0) {
                    currentCache.length = 0
                }
                currentCache.push(...newItems)
            },
            forceRefetch: ({ currentArg, previousArg }) => JSON.stringify(currentArg) !== JSON.stringify(previousArg),
            providesTags: ['Categories']
        })
    }),
    overrideExisting: false
})

export const { useCategoryOptionsQuery } = categoriesApi
