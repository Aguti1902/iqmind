// Esquema de base de datos para usuarios
export interface User {
  id: string
  email: string
  password: string // Hasheada
  userName: string
  iq?: number
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired'
  subscriptionId?: string
  trialEndDate?: string
  accessUntil?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export interface PasswordReset {
  id: string
  email: string
  token: string
  expiresAt: string
  used: boolean
  createdAt: string
}

// Simulación de base de datos (en producción usarías PostgreSQL, MongoDB, etc.)
const users: User[] = []
const passwordResets: PasswordReset[] = []

export const db = {
  // Usuarios
  createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(user)
    return user
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    return users.find(user => user.email === email) || null
  },

  getUserById: async (id: string): Promise<User | null> => {
    return users.find(user => user.id === id) || null
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) return null
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return users[userIndex]
  },

  // Password resets
  createPasswordReset: async (email: string, token: string, expiresAt: string): Promise<PasswordReset> => {
    const passwordReset: PasswordReset = {
      id: `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      token,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    }
    passwordResets.push(passwordReset)
    return passwordReset
  },

  getPasswordResetByToken: async (token: string): Promise<PasswordReset | null> => {
    return passwordResets.find(reset => reset.token === token && !reset.used) || null
  },

  markPasswordResetAsUsed: async (token: string): Promise<void> => {
    const resetIndex = passwordResets.findIndex(reset => reset.token === token)
    if (resetIndex !== -1) {
      passwordResets[resetIndex].used = true
    }
  },

  // Limpiar resets expirados
  cleanExpiredResets: async (): Promise<void> => {
    const now = new Date().toISOString()
    for (let i = passwordResets.length - 1; i >= 0; i--) {
      if (passwordResets[i].expiresAt < now) {
        passwordResets.splice(i, 1)
      }
    }
  }
}
