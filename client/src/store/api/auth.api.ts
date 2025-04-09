import { apiSlice } from './apiSlice'

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        auth: builder.mutation({
            query: (auth) => {
                return {
                    url: '/user/auth/login',
                    method: 'POST',
                    body: auth
                }
            }
        }),
        sendCode: builder.mutation({
            query: (auth) => {
                return {
                    url: '/user/auth/send-me-code',
                    method: 'POST',
                    body: auth
                }
            }
        })
    }),
    overrideExisting: false
})

export const { useAuthMutation, useSendCodeMutation } = authApi
