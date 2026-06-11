import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "citizen" | "municipal" | "contractor";
export type AuthStep = "role-select" | "signup" | "verify" | "done";

export interface MockUser {
  email: string;
  password: string;
  role: Role;
  name: string;
}

export const MOCK_USERS: MockUser[] = [
  { email: "officer@patna.gov.in", password: "demo123", role: "municipal", name: "Arjun Singh" },
  { email: "priya@gmail.com", password: "demo123", role: "citizen", name: "Priya Sharma" },
  { email: "alpha@builders.com", password: "demo123", role: "contractor", name: "Rajesh Kumar" },
];

interface AuthState {
  role: Role | null;
  name: string | null;
  email: string | null;
  isAuthenticated: boolean;
  authStep: AuthStep;
  login: (role: Role, name?: string, email?: string) => void;
  logout: () => void;
  setAuthStep: (step: AuthStep) => void;
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
      email: null,
      isAuthenticated: false,
      authStep: "role-select",
      login: (role, name, email) =>
        set({
          role,
          name: name ?? defaultNames[role],
          email: email ?? null,
          isAuthenticated: true,
          authStep: "done",
        }),
      logout: () =>
        set({
          role: null,
          name: null,
          email: null,
          isAuthenticated: false,
          authStep: "role-select",
        }),
      setAuthStep: (step) => set({ authStep: step }),
    }),
    { name: "roadpulse-auth" }
  )
);
