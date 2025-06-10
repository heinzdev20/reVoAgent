import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  fetchCurrentUser: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
          }

          const data = await response.json();
          
          set({
            token: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Fetch user data
          await get().fetchCurrentUser();
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message,
            isAuthenticated: false,
            token: null,
            refreshToken: null,
            user: null,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Registration failed');
          }

          const user = await response.json();
          
          // Auto-login after registration
          await get().login(userData.email, userData.password);
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();
          
          set({
            token: data.access_token,
            refreshToken: data.refresh_token,
          });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      fetchCurrentUser: async () => {
        const { token } = get();
        
        if (!token) {
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              // Try to refresh token
              await get().refreshAccessToken();
              return get().fetchCurrentUser();
            }
            throw new Error('Failed to fetch user data');
          }

          const user = await response.json();
          set({ user });
        } catch (error: any) {
          console.error('Failed to fetch current user:', error);
          if (error.message.includes('401') || error.message.includes('Token')) {
            get().logout();
          }
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auto-refresh token on app load
if (typeof window !== 'undefined') {
  const store = useAuthStore.getState();
  if (store.token && store.isAuthenticated) {
    store.fetchCurrentUser().catch(() => {
      // If fetching user fails, logout
      store.logout();
    });
  }
}