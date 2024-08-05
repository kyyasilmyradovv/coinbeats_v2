// src/store/useSessionStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

interface SessionState {
  sessionStartTime: number | null;
  sessionEndTime: number | null;
  routeDurations: Record<string, number>;
  userId: number | null; // This should be Telegram User ID
  username: string;
  roles: string[];
  addRouteDuration: (route: string, duration: number) => void;
  startSession: (data: { sessionStartTime: number; userId: number; username: string; roles: string[] }) => void;
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

    endSession: async () => {
      const state = get();
      const sessionEndTime = Date.now();
      const duration = Math.floor((sessionEndTime - (state.sessionStartTime || 0)) / 1000);

      try {
        await axios.post('http://localhost:7000/api/log-session', {
          telegramUserId: state.userId,
          sessionStart: state.sessionStartTime,
          sessionEnd: sessionEndTime,
          duration,
          routeDurations: state.routeDurations,
        });
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
