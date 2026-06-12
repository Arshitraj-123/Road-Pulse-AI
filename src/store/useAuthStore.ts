import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export type Role = "citizen" | "municipal" | "contractor";
export type AuthStep = "role-select" | "signup" | "verify" | "done";

interface AuthState {
  user: any | null;
  role: Role | null;
  roleData: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authStep: AuthStep;
  
  restoreSession: () => Promise<void>;
  citizenSignup: (formData: any) => Promise<any>;
  citizenLogin: (phoneOrEmail: string) => Promise<any>;
  verifyOTP: (identifier: string, otp: string, userId: string) => Promise<any>;
  municipalLogin: (email: string, password: string) => Promise<any>;
  contractorLogin: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  setAuthStep: (step: AuthStep) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      roleData: null,
      isAuthenticated: false,
      isLoading: true, // Start true so splash screen shows until session check completes
      authStep: "role-select",

      restoreSession: async () => {
        try {
          set({ isLoading: true });
          // Bypass api interceptor here so 401s don't cause an infinite redirect loop on page load
          const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${BASE_URL}/api/auth/me`, {
            credentials: 'include'
          });
          
          if (!res.ok) {
            throw new Error("Not authenticated");
          }
          
          const data = await res.json();
          if (data.success) {
            set({
              user: data.user,
              role: data.user.role,
              roleData: data.roleData,
              isAuthenticated: true
            });
          } else {
            throw new Error("Not authenticated");
          }
        } catch (e) {
          set({ isAuthenticated: false, user: null, role: null, roleData: null });
        } finally {
          set({ isLoading: false });
        }
      },

      citizenSignup: async (formData) => {
        const data = await api.post('/api/auth/citizen/signup', formData);
        return data;
      },

      citizenLogin: async (phoneOrEmail) => {
        const isEmail = phoneOrEmail.includes('@');
        const payload = isEmail ? { email: phoneOrEmail } : { phone: "+91" + phoneOrEmail.replace(/\D/g, "").slice(0, 10) };
        const data = await api.post('/api/auth/citizen/login', payload);
        return data;
      },

      verifyOTP: async (identifier, otp, userId) => {
        const data = await api.post('/api/auth/verify-otp', { identifier, otp, userId });
        if (data.success) {
          set({
            user: data.user,
            role: data.user.role,
            roleData: data.citizenData,
            isAuthenticated: true,
            authStep: "done"
          });
        }
        return data;
      },

      municipalLogin: async (email, password) => {
        const data = await api.post('/api/auth/municipal/login', { email, password });
        if (data.success) {
          set({
            user: data.user,
            role: 'municipal',
            roleData: data.municipalityData,
            isAuthenticated: true,
            authStep: "done"
          });
        }
        return data;
      },

      contractorLogin: async (email, password) => {
        const data = await api.post('/api/auth/contractor/login', { email, password });
        if (data.success) {
          // Always set auth state — frontend guards handle routing
          // based on roleData.approvalStatus (approved/pending/rejected/blacklisted)
          set({
            user: data.user,
            role: 'contractor',
            roleData: data.contractorData,
            isAuthenticated: true,
            authStep: "done"
          });
        }
        return data;
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout', {});
        } catch(e) {}
        set({
          user: null,
          role: null,
          roleData: null,
          isAuthenticated: false,
          isLoading: false,
          authStep: "role-select",
        });
      },

      setAuthStep: (step) => set({ authStep: step }),
    }),
    { name: "rp-auth" }
  )
);
