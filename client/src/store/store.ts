import { generalSlice } from './general/generalSlice'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './api/apiSlice'
import { academySlice } from './academy/academySlice'
import { userSlice } from './user/userSlice'

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        academy: academySlice.reducer,
        general: generalSlice.reducer,
        user: userSlice.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(apiSlice.middleware)
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
