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
        })
    }),
    overrideExisting: false
})

export const { useAuthMutation } = authApi
