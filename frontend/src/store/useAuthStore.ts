import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiService } from "@/lib/api";

interface UserSession {
  email: string;
  role: string;
  access_token: string;
  full_name?: string;
}

interface AuthStore {
  user: UserSession | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.login({ email, password });
          const userSession: UserSession = {
            email: response.email,
            role: response.role,
            access_token: response.access_token,
            full_name: response.full_name,
          };
          set({ user: userSession, loading: false });
          return true;
        } catch (error: any) {
          set({ error: error.message || "Login failed", loading: false });
          return false;
        }
      },
      register: async (email, password, fullName) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.register({ email, password, full_name: fullName });
          const userSession: UserSession = {
            email: response.email,
            role: response.role,
            access_token: response.access_token,
            full_name: response.full_name,
          };
          set({ user: userSession, loading: false });
          return true;
        } catch (error: any) {
          set({ error: error.message || "Registration failed", loading: false });
          return false;
        }
      },
      logout: () => {
        set({ user: null, error: null });
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "ecomerge-auth",
    }
  )
);
