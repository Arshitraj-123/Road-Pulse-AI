import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "citizen" | "municipal" | "contractor";

interface AuthState {
  role: Role | null;
  name: string | null;
  isAuthenticated: boolean;
  login: (role: Role, name?: string) => void;
  logout: () => void;
}

const defaultNames: Record<Role, string> = {
  citizen: "Priya Sharma",
  municipal: "Arjun Singh",
  contractor: "Alpha Builders",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      name: null,
      isAuthenticated: false,
      login: (role, name) =>
        set({ role, name: name ?? defaultNames[role], isAuthenticated: true }),
      logout: () => set({ role: null, name: null, isAuthenticated: false }),
    }),
    { name: "roadpulse-auth" }
  )
);
