// Esquema de base de datos para usuarios
export interface TestResult {
  id: string
  userId: string
  iq: number
  correctAnswers: number
  timeElapsed: number
  answers: (number | null)[]
  categoryScores: Record<string, number>
  completedAt: string
  createdAt: string
}

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
  testResults?: TestResult[]
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

// Usuario de prueba predefinido (se creará automáticamente)
let testUserCreated = false

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
    // Si es el usuario de prueba y aún no se ha creado, crearlo
    if (email === 'test@iqmind.io' && !testUserCreated) {
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('Test1234!', 12)
      const testUser: User = {
        id: 'test-user-001',
        email: 'test@iqmind.io',
        password: hashedPassword,
        userName: 'Usuario Test',
        iq: 125,
        subscriptionStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      users.push(testUser)
      testUserCreated = true
      console.log('✅ Usuario de prueba creado automáticamente')
    }
    
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
