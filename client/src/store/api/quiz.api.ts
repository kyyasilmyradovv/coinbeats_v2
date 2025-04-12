import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'

export const quizzesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        quizzes: builder.query({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/quizzes', removeEmpty(parameters)),
                    method: 'GET'
                }
            },
            providesTags: ['Quizzes']
        })
    }),
    overrideExisting: false
})

export const { useQuizzesQuery } = quizzesApi
