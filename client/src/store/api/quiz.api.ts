import { buildUrlWithParams, removeEmpty } from '@/lib/utils'
import { apiSlice } from './apiSlice'
import { TQuizFinishResult, TQuizSendInfo, TSubmitParams, TSubmitResponse } from '@/types/quiz'
import { setQuizzes } from '../quiz/quizSlice'

export const quizzesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        quizzes: builder.query({
            query: (parameters) => {
                return {
                    url: buildUrlWithParams('/quizzes', removeEmpty(parameters)),
                    method: 'GET'
                }
            },
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled
                    dispatch(setQuizzes(data))
                } catch (error) {
                    console.error('Query failed:', error)
                }
            },
            providesTags: ['Quizzes']
        }),
        submitQuiz: builder.mutation<TSubmitResponse, TSubmitParams>({
            query: (params: TSubmitParams) => ({
                url: '/quizzes/submit',
                method: 'POST',
                body: params
            })
        })
    }),
    overrideExisting: false
})

export const { useQuizzesQuery, useSubmitQuizMutation } = quizzesApi
