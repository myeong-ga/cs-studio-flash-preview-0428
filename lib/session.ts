// Session management for the simulation
import { create } from "zustand"

interface SessionState {
  userId: string
  isAuthenticated: boolean
  userRole: "customer" | "operator"
  sessionId: string
  lastActivity: Date

  // Session actions
  setUserId: (userId: string) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setUserRole: (role: "customer" | "operator") => void
  updateLastActivity: () => void
}

export const useSession = create<SessionState>((set) => ({
  // Default session values for the simulation
  userId: "cus_28X44", // Default user ID for simulation
  isAuthenticated: true, // Assume authenticated in simulation
  userRole: "operator", // Default role
  sessionId: `session_${Math.random().toString(36).substring(2, 15)}`,
  lastActivity: new Date(),

  // Session actions
  setUserId: (userId: string) => set({ userId }),
  setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setUserRole: (role: "customer" | "operator") => set({ userRole: role }),
  updateLastActivity: () => set({ lastActivity: new Date() }),
}))

// Helper function to get the current user ID
export const getCurrentUserId = (): string => {
  return useSession.getState().userId
}

// Helper function to update last activity timestamp
export const updateActivity = (): void => {
  useSession.getState().updateLastActivity()
}
