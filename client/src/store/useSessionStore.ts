// src/store/useSessionStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from '../api/axiosInstance';

interface SessionState {
  sessionStartTime: number | null;
  sessionEndTime: number | null;
  routeDurations: Record<string, number>;
  userId: number | null;
  username: string;
  roles: string[];
  currentRoute: string;
  darkMode: boolean;
  theme: string;
  colorTheme: string;
  setCurrentRoute: (route: string) => void;
  addRouteDuration: (route: string, duration: number) => void;
  startSession: (data: { sessionStartTime: number; userId: number | null; username: string; roles: string[] }) => void;
  setDarkMode: (darkMode: boolean) => void;
  setTheme: (theme: string) => void;
  setColorTheme: (colorTheme: string) => void;
  initializePreferences: () => void;
  endSession: () => void;
}

const useSessionStore = create<SessionState>()(
  devtools((set, get) => ({
    sessionStartTime: null,
    sessionEndTime: null,
    routeDurations: {},
    userId: null,
    username: 'Guest',
    roles: ['USER'],
    currentRoute: '/',
    darkMode: true,
    theme: 'ios',
    colorTheme: '',

    setCurrentRoute: (route) => set({ currentRoute: route }),

    startSession: ({ sessionStartTime, userId, username, roles }) => set({
      sessionStartTime,
      userId,
      username,
      roles,
      routeDurations: {},
    }),

    addRouteDuration: (route, duration) => set((state) => ({
      routeDurations: {
        ...state.routeDurations,
        [route]: (state.routeDurations[route] || 0) + duration,
      },
    })),

    setDarkMode: (darkMode) => {
      set({ darkMode });
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      document.documentElement.classList.toggle('dark', darkMode);
    },

    setTheme: (theme) => {
      set({ theme });
      localStorage.setItem('theme', theme);
    },

    setColorTheme: (colorTheme) => {
      set({ colorTheme });
      localStorage.setItem('colorTheme', colorTheme);
    },

    initializePreferences: async () => {
      const darkMode = localStorage.getItem('darkMode');
      const theme = localStorage.getItem('theme');
      const colorTheme = localStorage.getItem('colorTheme');
   
      // Set state with the correct darkMode value
      set({
        darkMode: darkMode !== null ? JSON.parse(darkMode) : false,  // Default to false if no value found
        theme: theme || 'ios',
        colorTheme: colorTheme || '',
      });
   
      // Ensure the dark mode class is correctly applied based on darkMode state
      document.documentElement.classList.toggle('dark', darkMode !== null ? JSON.parse(darkMode) : false);
   },   

    endSession: async () => {
      const state = get();
      const sessionEndTime = Date.now();
      const duration = Math.floor((sessionEndTime - (state.sessionStartTime || 0)) / 1000);

      try {
        await axios.post('/api/log-session', {
          telegramUserId: state.userId || 0,
          sessionStart: state.sessionStartTime,
          sessionEnd: sessionEndTime,
          duration,
          routeDurations: state.routeDurations,
        });
        console.log('Session ended and logged');
      } catch (error) {
        console.error('Error logging session:', error);
      } finally {
        set({
          sessionStartTime: null,
          sessionEndTime: null,
          routeDurations: {},
          userId: null,
          username: 'Guest',
          roles: ['USER'],
        });
      }
    },
  }))
);

export default useSessionStore;
