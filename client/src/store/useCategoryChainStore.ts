// src/store/useCategoryChainStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

interface Category {
    id: number
    name: string
}

interface Chain {
    id: number
    name: string
}

interface CategoryChainState {
    categories: Category[]
    chains: Chain[]
    fetchCategories: () => Promise<void>
    fetchChains: () => Promise<void>
    fetchCategoriesAndChains: () => Promise<void>
}

const useCategoryChainStore = create<CategoryChainState>()(
    devtools((set, get) => ({
        categories: [],
        chains: [],

        // Fetches categories
        fetchCategories: async () => {
            try {
                // Endpoint: GET /api/categories
                const response = await axiosInstance.get('/api/categories')
                set({ categories: response.data })
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        },

        // Fetches chains
        fetchChains: async () => {
            try {
                // Endpoint: GET /api/chains
                const response = await axiosInstance.get('/api/chains')
                set({ chains: response.data })
            } catch (error) {
                console.error('Error fetching chains:', error)
            }
        },

        // Fetches both categories and chains
        fetchCategoriesAndChains: async () => {
            try {
                await Promise.all([get().fetchCategories(), get().fetchChains()])
            } catch (error) {
                console.error('Error fetching categories and chains:', error)
            }
        }
    }))
)

export default useCategoryChainStore
