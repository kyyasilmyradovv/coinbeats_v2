// src/store/useSessionStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from '../api/axiosInstance'; // Use the main axios instance

interface SessionState {
  sessionStartTime: number | null;
  sessionEndTime: number | null;
  routeDurations: Record<string, number>;
  userId: number | null;
  username: string;
  roles: string[];
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  addRouteDuration: (route: string, duration: number) => void;
  startSession: (data: { sessionStartTime: number; userId: number | null; username: string; roles: string[] }) => void;
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

    setCurrentRoute: (route) => set({ currentRoute: route }),

    startSession: ({ sessionStartTime, userId, username, roles }) => set({
      sessionStartTime,
      userId,
      username,
      roles,
      routeDurations: {}, // Reset durations at the start of a new session
    }),

    addRouteDuration: (route, duration) => set((state) => ({
      routeDurations: {
        ...state.routeDurations,
        [route]: (state.routeDurations[route] || 0) + duration,
      },
    })),

    endSession: async () => {
      const state = get();
      const sessionEndTime = Date.now();
      const duration = Math.floor((sessionEndTime - (state.sessionStartTime || 0)) / 1000);

      try {
        await axios.post('/api/log-session', {
          telegramUserId: state.userId || 0, // Assuming 0 for guest users
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
