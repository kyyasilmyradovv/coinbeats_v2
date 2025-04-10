import { TProfile, TTokens } from '@/types/user'
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
        verify: builder.mutation({
            query: (auth) => {
                return {
                    url: '/user/auth/verify',
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
        }),
        createProfile: builder.mutation<TProfile & TTokens, any>({
            query: (params) => {
                return {
                    url: `/user/auth/profile`,
                    method: 'PUT',
                    body: params
                }
            },
            invalidatesTags: ['Profile']
        })
    }),
    overrideExisting: false
})

export const { useAuthMutation, useSendCodeMutation, useProfileQuery, useVerifyMutation, useCreateProfileMutation } = authApi
