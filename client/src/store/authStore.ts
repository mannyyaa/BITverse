/**
 * Authentication store.
 *
 * Stores the current user + JWT in memory (token also in localStorage via api.ts).
 * Exposes the server-connection state so the rest of the app knows whether to
 * use the API or stay in local-only mode.
 */
import { create } from "zustand";
import { api, getToken, setToken, clearToken, type ApiUser, ApiClientError } from "@/lib/api";

export type ServerStatus = "unknown" | "online" | "offline";

interface AuthState {
  user: ApiUser | null;
  isAuthenticated: boolean;
  serverStatus: ServerStatus;
  authError: string | null;
  isLoading: boolean;

  login:    (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout:   () => void;
  checkAuth: () => Promise<void>;
  checkServer: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  isAuthenticated: false,
  serverStatus:    "unknown",
  authError:       null,
  isLoading:       false,

  checkServer: async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/health`,
        { signal: AbortSignal.timeout(3000) },
      );
      set({ serverStatus: res.ok ? "online" : "offline" });
    } catch {
      set({ serverStatus: "offline" });
    }
  },

  checkAuth: async () => {
    const token = getToken();
    if (!token) { set({ isAuthenticated: false, user: null }); return; }
    try {
      const user = await api.auth.me();
      set({ user, isAuthenticated: true });
    } catch {
      clearToken();
      set({ user: null, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    try {
      const { token, user } = await api.auth.login(email, password);
      setToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Login failed";
      set({ authError: msg, isLoading: false });
      throw err;
    }
  },

  register: async (email, name, password) => {
    set({ isLoading: true, authError: null });
    try {
      const { token, user } = await api.auth.register(email, name, password);
      setToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Registration failed";
      set({ authError: msg, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    clearToken();
    set({ user: null, isAuthenticated: false, authError: null });
  },
}));
