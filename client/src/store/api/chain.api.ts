import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TChain } from '@/types/chain'

export const chainsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        chainOptions: builder.query({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/chains', removeEmpty(parameters)),
                    method: 'GET'
                }
            },
            transformResponse: async (baseQueryReturnValue, _meta, _arg) => {
                let result =
                    (baseQueryReturnValue as TChain[])?.map((e) => ({
                        label: e.name,
                        value: e.id
                    })) || []

                return result
            },
            serializeQueryArgs: ({ endpointName }) => endpointName,
            merge: (currentCache, newItems, { arg: { offset } }) => {
                if (offset === 0) {
                    currentCache.length = 0
                }
                currentCache.push(...newItems)
            },
            forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
            providesTags: ['Chains']
        })
    }),
    overrideExisting: false
})

export const { useChainOptionsQuery } = chainsApi
