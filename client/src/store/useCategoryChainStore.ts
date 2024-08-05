// src/store/useCategoryChainStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
}

interface Chain {
  id: number;
  name: string;
}

interface CategoryChainState {
  categories: Category[];
  chains: Chain[];
  fetchCategoriesAndChains: () => Promise<void>;
}

const useCategoryChainStore = create<CategoryChainState>()(
  devtools((set) => ({
    categories: [],
    chains: [],

    fetchCategoriesAndChains: async () => {
      try {
        const [categoriesResponse, chainsResponse] = await Promise.all([
          axios.get('http://localhost:7000/api/categories'),
          axios.get('http://localhost:7000/api/chains'),
        ]);

        set({ 
          categories: categoriesResponse.data, 
          chains: chainsResponse.data 
        });
      } catch (error) {
        console.error('Error fetching categories and chains:', error);
      }
    },
  }))
);

export default useCategoryChainStore;
