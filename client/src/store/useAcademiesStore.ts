// src/store/useAcademiesStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

const useAcademiesStore = create()(
    devtools((set) => ({
        academies: [],
        isLoading: false,
        fetchAcademies: async () => {
            set({ isLoading: true })
            try {
                const response = await axiosInstance.get('/api/academies/academies')
                const approvedAcademies = response.data.filter((academy: any) => academy.status === 'approved')
                // Additional data manipulation if needed
                set({ academies: approvedAcademies, isLoading: false })
            } catch (error) {
                console.error('Error fetching academies:', error)
                set({ isLoading: false })
            }
        }
    }))
)

export default useAcademiesStore
