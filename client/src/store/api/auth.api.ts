import { TProfile } from '@/types/user'
import { apiSlice } from './apiSlice'
import { setProfil } from '../user/userSlice'

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        auth: builder.mutation({
            query: (auth) => {
                return {
                    url: '/user/auth/login',
                    method: 'POST',
                    body: auth
                }
            },
            invalidatesTags: ['Profile']
        }),
        sendCode: builder.mutation({
            query: (auth) => {
                return {
                    url: '/user/auth/send-me-code',
                    method: 'POST',
                    body: auth
                }
            }
        }),
        profile: builder.query<TProfile, any>({
            query: () => {
                return {
                    url: `/user/auth/profile`,
                    method: 'GET'
                }
            },
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled
                    dispatch(setProfil(data))
                } catch (error) {
                    console.error('Query failed:', error)
                }
            },
            providesTags: ['Profile']
        })
    }),
    overrideExisting: false
})

export const { useAuthMutation, useSendCodeMutation, useProfileQuery } = authApi
