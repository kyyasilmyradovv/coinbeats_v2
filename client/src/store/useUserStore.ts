// client/src/store/useUserStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type UserRole = 'USER' | 'CREATOR' | 'ADMIN' | 'SUPERADMIN';

interface UserState {
  userId: number | null;
  username: string;
  email: string;
  emailConfirmed: boolean; // Track email confirmation status
  role: UserRole;
  points: number;
  authenticated: boolean;
  token: string | null;
  hasAcademy: boolean;
  theme: string;
  colorTheme: string;
  darkMode: boolean;
  sidebarOpened: boolean; 

  setUser: (
    userId: number | null,
    username: string,
    email: string,
    emailConfirmed: boolean, // Include emailConfirmed
    role: UserRole,
    points: number,
    token: string | null,
    hasAcademy: boolean
  ) => void;
  
  loginUser: (data: {
    userId: number;
    username: string;
    email: string;
    emailConfirmed: boolean; // Include emailConfirmed
    role: UserRole;
    points: number;
    token: string;
    hasAcademy: boolean;
  }) => void;

  logoutUser: () => void;
  updateUserRole: (role: UserRole) => void;

  setTheme: (theme: string) => void;
  setColorTheme: (colorTheme: string) => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleSidebar: () => void; 
}

const useUserStore = create<UserState>()(
  devtools((set) => ({
    userId: null,
    username: '',
    email: '',
    emailConfirmed: false, // Default to false
    role: 'USER',
    points: 100,
    authenticated: false,
    token: null,
    hasAcademy: false,
    theme: 'ios',
    colorTheme: '',
    darkMode: false,
    sidebarOpened: false, 

    setUser: (userId, username, email, emailConfirmed, role, points, token, hasAcademy) =>
      set({
        userId,
        username,
        email,
        emailConfirmed, // Set emailConfirmed state
        role,
        points,
        token,
        hasAcademy,
      }),

    loginUser: ({ userId, username, email, emailConfirmed, role, points, token, hasAcademy }) =>
      set({
        userId,
        username,
        email,
        emailConfirmed, // Set emailConfirmed state
        role,
        points,
        authenticated: true,
        token,
        hasAcademy,
      }),

    logoutUser: () =>
      set({
        userId: null,
        username: '',
        email: '',
        emailConfirmed: false, // Reset emailConfirmed on logout
        role: 'USER',
        points: 100,
        authenticated: false,
        token: null,
        hasAcademy: false,
        sidebarOpened: false, 
      }),

    updateUserRole: (role) => set({ role: role || 'USER' }),

    setTheme: (theme) => set({ theme }),
    setColorTheme: (colorTheme) => set({ colorTheme }),
    setDarkMode: (darkMode) => set({ darkMode }),

    toggleSidebar: () =>
      set((state) => ({ sidebarOpened: !state.sidebarOpened })),
  }))
);

export default useUserStore;
