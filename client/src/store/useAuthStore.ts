// src/store/useAuthStore.ts
import create from 'zustand';
import axios from '../utils/axiosInstance';
import jwtDecode from 'jwt-decode';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  userRole: null,

  login: async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password });
      const { accessToken, refreshToken } = response.data;
      const decodedToken: any = jwtDecode(accessToken);

      set({ accessToken, refreshToken, userRole: decodedToken.role });
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      console.error('Login failed:', error);
    }
  },

  logout: () => {
    set({ accessToken: null, refreshToken: null, userRole: null });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  refreshAccessToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post('/refresh', { refreshToken });
      const { accessToken } = response.data;
      set({ accessToken });
      localStorage.setItem('accessToken', accessToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  },
}));

export default useAuthStore;
