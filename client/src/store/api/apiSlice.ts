import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'
import { toast } from 'sonner'

type TToken = {
    accessToken: string
    refreshToken: string
}
const mutex = new Mutex()

const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
        const accessToken = localStorage.getItem('coinbeatsAT') ?? ''

        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`)
        }
        headers.set('Api-Version', '2')
        return headers
    }
})

const baseQueryWithReAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock()
    const release = await mutex.acquire()

    const refreshToken = localStorage.getItem('coinbeatsRT') ?? ''

    let result = await baseQuery(args, api, extraOptions)

    if (result.error && result.error.status === 498) {
        var credentials = { refreshToken: refreshToken }
        try {
            const refreshResult = await baseQuery(
                {
                    url: '/user/auth/refresh-token',
                    method: 'POST',
                    body: credentials
                },
                api,
                extraOptions
            )

            if ('data' in refreshResult) {
                const { data } = refreshResult as { data: TToken }
                const { accessToken, refreshToken } = data

                localStorage.setItem('coinbeatsAT', accessToken)
                localStorage.setItem('coinbeatsRT', refreshToken)

                result = await baseQuery(args, api, extraOptions)
            } else {
                if (((refreshResult.error as any).originalStatus ?? (refreshResult.error as any).status) === 409) {
                    toast('Attention!', {
                        description: 'Token Conflict',
                        position: 'top-right'
                    })
                }
            }
        } finally {
            release()
        }
    }

    release()

    return result
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReAuth,
    refetchOnReconnect: true,
    tagTypes: ['Academies', 'Academy', 'Categories', 'Chains', 'Profile', 'Quizzes', 'Raffles', 'Counter', 'Points', 'PointHistory'],
    endpoints: () => ({})
})
