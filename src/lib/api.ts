import { useAuthStore } from "@/store/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Global response handler — catches 401 (expired session) and 403 (wrong role)
 * and triggers appropriate frontend actions (logout, redirect).
 */
const handleResponse = async (res: Response) => {
  if (res.status === 401) {
    // Token expired or invalid — clear auth and redirect to login
    useAuthStore.getState().logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/login?reason=expired'
    }
    throw new Error('Session expired')
  }

  if (res.status === 403) {
    // Wrong role or insufficient permissions
    const data = await res.json().catch(() => ({}))
    // If it's a role mismatch (not an approval issue), redirect to /unauthorized
    if (data.requiredRole && typeof window !== 'undefined') {
      window.location.href = `/unauthorized?required=${data.requiredRole}&from=${encodeURIComponent(window.location.pathname)}`
      throw new Error('Unauthorized')
    }
    // For approval-related 403s, return the data normally so the caller can handle it
    return data
  }

  return res.json()
}

export const api = {
  post: async (endpoint: string, body: any) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // sends cookies
      body: JSON.stringify(body)
    })
    return handleResponse(res)
  },
  get: async (endpoint: string) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: 'include'
    })
    return handleResponse(res)
  },
  patch: async (endpoint: string, body: any) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    })
    return handleResponse(res)
  }
}
