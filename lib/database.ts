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

// Agregar resultado de test para agutierrezgomez00@gmail.com
const testResultForAlejandro = {
  id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userId: 'user_1760529528247_37qumxd6j',
  iq: 125,
  correctAnswers: 15,
  timeElapsed: 1200,
  answers: Array(20).fill(1),
  categoryScores: {
    logicalReasoning: 80,
    visualPerception: 75,
    patternRecognition: 85,
    abstractThinking: 70,
    workingMemory: 90,
    processingSpeed: 65
  },
  completedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
}

// Función para agregar el resultado de test a Alejandro
function addTestResultToAlejandro() {
  const alejandroIndex = users.findIndex(user => user.email === 'agutierrezgomez00@gmail.com')
  if (alejandroIndex !== -1) {
    const alejandro = users[alejandroIndex]
    const currentTestResults = alejandro.testResults || []
    const updatedTestResults = [...currentTestResults, testResultForAlejandro]
    
    users[alejandroIndex] = {
      ...alejandro,
      testResults: updatedTestResults,
      iq: 125, // Actualizar IQ
      updatedAt: new Date().toISOString()
    }
    
    console.log('✅ Resultado de test agregado a Alejandro:', {
      iq: 125,
      correctAnswers: 15,
      testResultsCount: updatedTestResults.length
    })
  }
}

// Ejecutar al cargar el módulo
addTestResultToAlejandro()

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

  // TEST RESULTS
  createTestResult: async (testResult: Omit<TestResult, 'createdAt'>): Promise<TestResult> => {
    const user = users.find(u => u.id === testResult.userId)
    if (!user) throw new Error('User not found')
    
    const newTestResult: TestResult = {
      ...testResult,
      createdAt: new Date().toISOString(),
    }
    
    user.testResults = user.testResults || []
    user.testResults.push(newTestResult)
    
    return newTestResult
  },

  getTestResultsByUserId: async (userId: string): Promise<TestResult[]> => {
    const user = users.find(u => u.id === userId)
    return user?.testResults || []
  },

  // PASSWORD RESETS
  createPasswordResetToken: async (email: string, token: string, expiresAt: string): Promise<void> => {
    const passwordReset: PasswordReset = {
      id: `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      token,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    }
    passwordResets.push(passwordReset)
  },

  findPasswordResetToken: async (token: string): Promise<PasswordReset | null> => {
    return passwordResets.find(reset => reset.token === token && !reset.used) || null
  },

  invalidatePasswordResetToken: async (token: string): Promise<void> => {
    const resetIndex = passwordResets.findIndex(reset => reset.token === token)
    if (resetIndex !== -1) {
      passwordResets[resetIndex].used = true
    }
  },

  // LEGACY - mantener compatibilidad
  getPasswordResetByToken: async (token: string): Promise<PasswordReset | null> => {
    return passwordResets.find(reset => reset.token === token && !reset.used) || null
  },

  markPasswordResetAsUsed: async (token: string): Promise<void> => {
    const resetIndex = passwordResets.findIndex(reset => reset.token === token)
    if (resetIndex !== -1) {
      passwordResets[resetIndex].used = true
    }
  },

  cleanExpiredResets: async (): Promise<void> => {
    const now = new Date().toISOString()
    for (let i = passwordResets.length - 1; i >= 0; i--) {
      if (passwordResets[i].expiresAt < now) {
        passwordResets.splice(i, 1)
      }
    }
  }
}
