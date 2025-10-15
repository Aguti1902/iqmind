import { createPool } from '@vercel/postgres'

const pool = createPool()

// Interfaces para TypeScript
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
  password: string
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

export const db = {
  // ============================================
  // USUARIOS
  // ============================================
  
  createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const result = await pool.sql`
      INSERT INTO users (
        id, email, password, user_name, iq, subscription_status,
        subscription_id, trial_end_date, access_until, created_at, updated_at
      ) VALUES (
        ${id}, ${userData.email}, ${userData.password}, ${userData.userName},
        ${userData.iq || 0}, ${userData.subscriptionStatus}, 
        ${userData.subscriptionId || null}, ${userData.trialEndDate || null},
        ${userData.accessUntil || null}, ${now}, ${now}
      )
      RETURNING *
    `
    
    const user = result.rows[0]
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      userName: user.user_name,
      iq: user.iq,
      subscriptionStatus: user.subscription_status,
      subscriptionId: user.subscription_id,
      trialEndDate: user.trial_end_date,
      accessUntil: user.access_until,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: user.last_login
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const result = await pool.sql`
        SELECT * FROM users WHERE email = ${email} LIMIT 1
      `
      
      if (result.rows.length === 0) return null
      
      const user = result.rows[0]
      
      // Obtener test results del usuario
      const testResultsQuery = await pool.sql`
        SELECT * FROM test_results 
        WHERE user_id = ${user.id}
        ORDER BY completed_at DESC
      `
      
      const testResults = testResultsQuery.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        iq: row.iq,
        correctAnswers: row.correct_answers,
        timeElapsed: row.time_elapsed,
        answers: row.answers,
        categoryScores: row.category_scores,
        completedAt: row.completed_at,
        createdAt: row.created_at
      }))
      
      return {
        id: user.id,
        email: user.email,
        password: user.password,
        userName: user.user_name,
        iq: user.iq,
        subscriptionStatus: user.subscription_status,
        subscriptionId: user.subscription_id,
        trialEndDate: user.trial_end_date,
        accessUntil: user.access_until,
        testResults,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      }
    } catch (error) {
      console.error('Error getting user by email:', error)
      return null
    }
  },

  getUserById: async (id: string): Promise<User | null> => {
    try {
      const result = await pool.sql`
        SELECT * FROM users WHERE id = ${id} LIMIT 1
      `
      
      if (result.rows.length === 0) return null
      
      const user = result.rows[0]
      
      // Obtener test results del usuario
      const testResultsQuery = await pool.sql`
        SELECT * FROM test_results 
        WHERE user_id = ${user.id}
        ORDER BY completed_at DESC
      `
      
      const testResults = testResultsQuery.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        iq: row.iq,
        correctAnswers: row.correct_answers,
        timeElapsed: row.time_elapsed,
        answers: row.answers,
        categoryScores: row.category_scores,
        completedAt: row.completed_at,
        createdAt: row.created_at
      }))
      
      return {
        id: user.id,
        email: user.email,
        password: user.password,
        userName: user.user_name,
        iq: user.iq,
        subscriptionStatus: user.subscription_status,
        subscriptionId: user.subscription_id,
        trialEndDate: user.trial_end_date,
        accessUntil: user.access_until,
        testResults,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      }
    } catch (error) {
      console.error('Error getting user by id:', error)
      return null
    }
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    try {
      const now = new Date().toISOString()
      
      // Construir query dinámicamente solo con los campos proporcionados
      const setClauses: string[] = []
      const values: any[] = []
      let paramIndex = 1
      
      if (updates.userName !== undefined) {
        setClauses.push(`user_name = $${paramIndex++}`)
        values.push(updates.userName)
      }
      if (updates.iq !== undefined) {
        setClauses.push(`iq = $${paramIndex++}`)
        values.push(updates.iq)
      }
      if (updates.password !== undefined) {
        setClauses.push(`password = $${paramIndex++}`)
        values.push(updates.password)
      }
      if (updates.subscriptionStatus !== undefined) {
        setClauses.push(`subscription_status = $${paramIndex++}`)
        values.push(updates.subscriptionStatus)
      }
      if (updates.subscriptionId !== undefined) {
        setClauses.push(`subscription_id = $${paramIndex++}`)
        values.push(updates.subscriptionId)
      }
      if (updates.trialEndDate !== undefined) {
        setClauses.push(`trial_end_date = $${paramIndex++}`)
        values.push(updates.trialEndDate)
      }
      if (updates.accessUntil !== undefined) {
        setClauses.push(`access_until = $${paramIndex++}`)
        values.push(updates.accessUntil)
      }
      if (updates.lastLogin !== undefined) {
        setClauses.push(`last_login = $${paramIndex++}`)
        values.push(updates.lastLogin)
      }
      
      // Siempre actualizar updated_at
      setClauses.push(`updated_at = $${paramIndex++}`)
      values.push(now)
      
      // Agregar ID al final
      values.push(id)
      
      const query = `
        UPDATE users 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `
      
      const result = await pool.query(query, values)
      
      if (result.rows.length === 0) return null
      
      const user = result.rows[0]
      
      // Obtener test results del usuario
      const testResultsQuery = await pool.sql`
        SELECT * FROM test_results 
        WHERE user_id = ${user.id}
        ORDER BY completed_at DESC
      `
      
      const testResults = testResultsQuery.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        iq: row.iq,
        correctAnswers: row.correct_answers,
        timeElapsed: row.time_elapsed,
        answers: row.answers,
        categoryScores: row.category_scores,
        completedAt: row.completed_at,
        createdAt: row.created_at
      }))
      
      return {
        id: user.id,
        email: user.email,
        password: user.password,
        userName: user.user_name,
        iq: user.iq,
        subscriptionStatus: user.subscription_status,
        subscriptionId: user.subscription_id,
        trialEndDate: user.trial_end_date,
        accessUntil: user.access_until,
        testResults,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      }
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  },

  // ============================================
  // TEST RESULTS
  // ============================================
  
  createTestResult: async (testResult: Omit<TestResult, 'createdAt'>): Promise<TestResult> => {
    const now = new Date().toISOString()
    
    const result = await pool.sql`
      INSERT INTO test_results (
        id, user_id, iq, correct_answers, time_elapsed,
        answers, category_scores, completed_at, created_at
      ) VALUES (
        ${testResult.id}, ${testResult.userId}, ${testResult.iq},
        ${testResult.correctAnswers}, ${testResult.timeElapsed},
        ${JSON.stringify(testResult.answers)}, ${JSON.stringify(testResult.categoryScores)},
        ${testResult.completedAt}, ${now}
      )
      RETURNING *
    `
    
    const row = result.rows[0]
    return {
      id: row.id,
      userId: row.user_id,
      iq: row.iq,
      correctAnswers: row.correct_answers,
      timeElapsed: row.time_elapsed,
      answers: row.answers,
      categoryScores: row.category_scores,
      completedAt: row.completed_at,
      createdAt: row.created_at
    }
  },

  getTestResultsByUserId: async (userId: string): Promise<TestResult[]> => {
    const result = await pool.sql`
      SELECT * FROM test_results 
      WHERE user_id = ${userId}
      ORDER BY completed_at DESC
    `
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      iq: row.iq,
      correctAnswers: row.correct_answers,
      timeElapsed: row.time_elapsed,
      answers: row.answers,
      categoryScores: row.category_scores,
      completedAt: row.completed_at,
      createdAt: row.created_at
    }))
  },

  // ============================================
  // PASSWORD RESETS
  // ============================================
  
  createPasswordResetToken: async (email: string, token: string, expiresAt: string): Promise<void> => {
    const id = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    await pool.sql`
      INSERT INTO password_resets (id, email, token, expires_at, used, created_at)
      VALUES (${id}, ${email}, ${token}, ${expiresAt}, FALSE, ${now})
    `
  },

  findPasswordResetToken: async (token: string): Promise<PasswordReset | null> => {
    const result = await pool.sql`
      SELECT * FROM password_resets 
      WHERE token = ${token} 
        AND used = FALSE 
        AND expires_at > NOW()
      LIMIT 1
    `
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      id: row.id,
      email: row.email,
      token: row.token,
      expiresAt: row.expires_at,
      used: row.used,
      createdAt: row.created_at
    }
  },

  invalidatePasswordResetToken: async (token: string): Promise<void> => {
    await pool.sql`
      UPDATE password_resets 
      SET used = TRUE 
      WHERE token = ${token}
    `
  }
}

