import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type UserRole = 'USER' | 'CREATOR' | 'ADMIN' | 'SUPERADMIN';

interface UserState {
  userId: number | null;
  username: string;
  email: string;
  role: UserRole;
  authenticated: boolean;
  token: string | null;
  setUser: (userId: number | null, username: string, role: UserRole, token: string | null) => void;
  loginUser: (data: { userId: number; username: string; email: string; role: UserRole; token: string }) => void;
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
    token: null,

    setUser: (userId, username, role, token) =>
      set({ userId, username, role: role || 'USER', token }),

    loginUser: ({ userId, username, email, role, token }) =>
      set({ userId, username, email, role, authenticated: true, token }),

    logoutUser: () =>
      set({
        userId: null,
        username: '',
        email: '',
        role: 'USER',
        authenticated: false,
        token: null,
      }),

    updateUserRole: (role) => set({ role: role || 'USER' }),
  }))
);

export default useUserStore;
