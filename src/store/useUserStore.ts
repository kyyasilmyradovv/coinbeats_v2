// src/store/useUserStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type UserRole = 'USER' | 'CREATOR' | 'ADMIN' | 'SUPERADMIN';

interface UserState {
  userId: number | null;
  username: string;
  email: string;
  role: UserRole;
  authenticated: boolean;
  setUser: (userId: number | null, username: string, role: UserRole) => void;
  loginUser: (data: { userId: number; username: string; email: string; role: UserRole }) => void;
  logoutUser: () => void;
  updateUserRole: (role: UserRole) => void;
}

const useUserStore = create<UserState>()(
  devtools((set) => ({
    userId: null,
    username: '',
    email: '',
    role: 'USER',
    authenticated: false,

    setUser: (userId, username, role) =>
      set({ userId, username, role: role || 'USER' }),

    loginUser: ({ userId, username, email, role }) =>
      set({ userId, username, email, role, authenticated: true }),

    logoutUser: () =>
      set({
        userId: null,
        username: '',
        email: '',
        role: 'USER',
        authenticated: false,
      }),

    updateUserRole: (role) => set({ role: role || 'USER' }),
  }))
);

export default useUserStore;
