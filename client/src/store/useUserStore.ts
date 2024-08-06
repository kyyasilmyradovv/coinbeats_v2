// client/src/store/useUserStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type UserRole = 'USER' | 'CREATOR' | 'ADMIN' | 'SUPERADMIN';

interface UserState {
  userId: number | null;
  username: string;
  email: string;
  role: UserRole;
  points: number; // Add points state
  authenticated: boolean;
  token: string | null;
  setUser: (userId: number | null, username: string, email: string, role: UserRole, points: number, token: string | null) => void;
  loginUser: (data: { userId: number; username: string; email: string; role: UserRole; points: number; token: string }) => void;
  logoutUser: () => void;
  updateUserRole: (role: UserRole) => void;
}

const useUserStore = create<UserState>()(
  devtools((set) => ({
    userId: null,
    username: '',
    email: '',
    role: 'USER',
    points: 100, // Default initial points value
    authenticated: false,
    token: null,

    setUser: (userId, username, email, role, points, token) => {
      // If points is undefined or null, use the current state points
      set((state) => ({
        userId,
        username,
        email,
        role: role || 'USER',
        points: points !== undefined ? points : state.points, // Preserve points if not provided
        token
      }));
    },

    loginUser: ({ userId, username, email, role, points, token }) =>
      set({ userId, username, email, role, points, authenticated: true, token }),

    logoutUser: () =>
      set({
        userId: null,
        username: '',
        email: '',
        role: 'USER',
        points: 100, // Reset points to 100 on logout
        authenticated: false,
        token: null,
      }),

    updateUserRole: (role) => set({ role: role || 'USER' }),
  }))
);

export default useUserStore;
