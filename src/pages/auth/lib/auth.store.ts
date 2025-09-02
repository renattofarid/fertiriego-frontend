import { create } from "zustand";
import type { Access, User } from "./auth.interface";
import { authenticate } from "./auth.actions";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  message: string | null;
  access?: Access[]; // Adjust type as needed
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setMessage: (message: string) => void;
  setAccess: (access: Access[]) => void;
  authenticate: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  message: localStorage.getItem("message"),
  person: null,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  setMessage: (message) => {
    localStorage.setItem("message", message);
    set({ message });
  },

  setAccess: (access) => {
    localStorage.setItem("access", JSON.stringify(access));
    set({ access });
  },

  authenticate: async () => {
    const { user, access } = await authenticate();
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      set({
        user,
        access,
        isAuthenticated: true,
      });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("access");
      set({
        user: undefined,
        token: undefined,
        isAuthenticated: false,
        access: [],
      });
    }
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("message");
    localStorage.removeItem("access");
    set({ token: null, user: null, message: null, access: [] });
  },
}));
