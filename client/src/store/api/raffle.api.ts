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
            providesTags: ['Raffles']
        })
    }),
    overrideExisting: false
})

export const { useRafflesQuery } = rafflesApi
