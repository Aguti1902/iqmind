import { Pool } from 'pg'

let pool: Pool | null = null

function getPool() {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('No se encontró POSTGRES_URL o DATABASE_URL en las variables de entorno')
    }
    
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

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

export interface SiteConfig {
  id: number
  key: string
  value: string
  description?: string
  updatedAt: string
  updatedBy?: string
}

export const db = {
  // ============================================
  // USUARIOS
  // ============================================
  
  createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const result = await getPool().query(
      `INSERT INTO users (
        id, email, password, user_name, iq, subscription_status,
        subscription_id, trial_end_date, access_until, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        id, 
        userData.email, 
        userData.password, 
        userData.userName,
        userData.iq || 0, 
        userData.subscriptionStatus, 
        userData.subscriptionId || null, 
        userData.trialEndDate || null,
        userData.accessUntil || null, 
        now, 
        now
      ]
    )
    
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
      const result = await getPool().query(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email]
      )
      
      if (result.rows.length === 0) return null
      
      const user = result.rows[0]
      
      // Obtener test results del usuario
      const testResultsQuery = await getPool().query(
        'SELECT * FROM test_results WHERE user_id = $1 ORDER BY completed_at DESC',
        [user.id]
      )
      
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
      const result = await getPool().query(
        'SELECT * FROM users WHERE id = $1 LIMIT 1',
        [id]
      )
      
      if (result.rows.length === 0) return null
      
      const user = result.rows[0]
      
      // Obtener test results del usuario
      const testResultsQuery = await getPool().query(
        'SELECT * FROM test_results WHERE user_id = $1 ORDER BY completed_at DESC',
        [user.id]
      )
      
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
      
      const result = await getPool().query(query, values)
      
      if (result.rows.length === 0) return null
      
      const user = result.rows[0]
      
      // Obtener test results del usuario
      const testResultsQuery = await getPool().query(
        'SELECT * FROM test_results WHERE user_id = $1 ORDER BY completed_at DESC',
        [user.id]
      )
      
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

  getUserBySubscriptionId: async (subscriptionId: string): Promise<User | null> => {
    try {
      const result = await getPool().query(
        'SELECT * FROM users WHERE subscription_id = $1 LIMIT 1',
        [subscriptionId]
      )
      
      if (result.rows.length === 0) return null
      
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
    } catch (error) {
      console.error('Error getting user by subscription ID:', error)
      return null
    }
  },

  updateUserSubscription: async (
    userId: string,
    subscriptionId: string,
    status: 'trial' | 'active' | 'cancelled' | 'expired',
    trialEndDate?: Date,
    accessUntil?: Date
  ): Promise<void> => {
    try {
      const updates: any = {
        subscriptionId,
        subscriptionStatus: status
      }
      
      if (trialEndDate) {
        updates.trialEndDate = trialEndDate.toISOString()
      }
      
      if (accessUntil) {
        updates.accessUntil = accessUntil.toISOString()
      }
      
      await db.updateUser(userId, updates)
    } catch (error) {
      console.error('Error updating user subscription:', error)
      throw error
    }
  },

  // ============================================
  // TEST RESULTS
  // ============================================
  
  createTestResult: async (testResult: Omit<TestResult, 'createdAt'>): Promise<TestResult> => {
    const now = new Date().toISOString()
    
    const result = await getPool().query(
      `INSERT INTO test_results (
        id, user_id, iq, correct_answers, time_elapsed,
        answers, category_scores, completed_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        testResult.id, 
        testResult.userId, 
        testResult.iq,
        testResult.correctAnswers, 
        testResult.timeElapsed,
        JSON.stringify(testResult.answers), 
        JSON.stringify(testResult.categoryScores),
        testResult.completedAt, 
        now
      ]
    )
    
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
    const result = await getPool().query(
      'SELECT * FROM test_results WHERE user_id = $1 ORDER BY completed_at DESC',
      [userId]
    )
    
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
    
    await getPool().query(
      'INSERT INTO password_resets (id, email, token, expires_at, used, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, email, token, expiresAt, false, now]
    )
  },

  findPasswordResetToken: async (token: string): Promise<PasswordReset | null> => {
    const result = await getPool().query(
      'SELECT * FROM password_resets WHERE token = $1 AND used = FALSE AND expires_at > NOW() LIMIT 1',
      [token]
    )
    
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
    await getPool().query(
      'UPDATE password_resets SET used = TRUE WHERE token = $1',
      [token]
    )
  },

  // ============================================
  // SITE CONFIGURATION
  // ============================================
  
  getAllConfig: async (): Promise<Record<string, string>> => {
    const result = await getPool().query(
      'SELECT key, value FROM site_config'
    )
    
    const config: Record<string, string> = {}
    result.rows.forEach(row => {
      config[row.key] = row.value
    })
    
    return config
  },

  getConfigByKey: async (key: string): Promise<string | null> => {
    const result = await getPool().query(
      'SELECT value FROM site_config WHERE key = $1 LIMIT 1',
      [key]
    )
    
    if (result.rows.length === 0) return null
    
    return result.rows[0].value
  },

  setConfig: async (key: string, value: string, updatedBy?: string): Promise<void> => {
    const now = new Date().toISOString()
    
    await getPool().query(
      `INSERT INTO site_config (key, value, updated_at, updated_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = $3, updated_by = $4`,
      [key, value, now, updatedBy || null]
    )
  },

  setMultipleConfig: async (configs: Record<string, string>, updatedBy?: string): Promise<void> => {
    const now = new Date().toISOString()
    
    for (const [key, value] of Object.entries(configs)) {
      await getPool().query(
        `INSERT INTO site_config (key, value, updated_at, updated_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = $3, updated_by = $4`,
        [key, value, now, updatedBy || null]
      )
    }
  },

  isAdmin: async (email: string): Promise<boolean> => {
    const adminEmails = await db.getConfigByKey('admin_emails')
    if (!adminEmails) return false
    
    const emailList = adminEmails.split(',').map(e => e.trim().toLowerCase())
    return emailList.includes(email.toLowerCase())
  },

  // ============================================
  // LOGS DEL AGENTE IA
  // ============================================

  createAiAgentLog: async (logData: {
    requestType: string
    customerEmail: string
    paymentEmail?: string
    language?: string
    requestReason?: string
    aiDecision: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    stripeRefundId?: string
    amountRefunded?: number
    processingTime?: number
    errorMessage?: string
    rawRequest?: any
    rawResponse?: any
  }): Promise<any> => {
    const result = await getPool().query(
      `INSERT INTO ai_agent_logs (
        request_type, customer_email, payment_email, language,
        request_reason, ai_decision, stripe_customer_id, stripe_subscription_id,
        stripe_refund_id, amount_refunded, processing_time, error_message,
        raw_request, raw_response, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING *`,
      [
        logData.requestType,
        logData.customerEmail,
        logData.paymentEmail || null,
        logData.language || null,
        logData.requestReason || null,
        logData.aiDecision,
        logData.stripeCustomerId || null,
        logData.stripeSubscriptionId || null,
        logData.stripeRefundId || null,
        logData.amountRefunded || null,
        logData.processingTime || null,
        logData.errorMessage || null,
        logData.rawRequest ? JSON.stringify(logData.rawRequest) : null,
        logData.rawResponse ? JSON.stringify(logData.rawResponse) : null
      ]
    )
    
    return result.rows[0]
  },

  getAiAgentLogs: async (limit: number = 50, offset: number = 0): Promise<any[]> => {
    const result = await getPool().query(
      `SELECT * FROM ai_agent_logs 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    
    return result.rows
  },

  getAiAgentStats: async (startDate?: Date): Promise<any> => {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default: last 30 days
    
    const result = await getPool().query(
      `SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN request_type = 'refund' AND ai_decision = 'approved' THEN 1 END) as refunds_approved,
        COUNT(CASE WHEN request_type = 'refund' AND ai_decision = 'denied' THEN 1 END) as refunds_denied,
        COUNT(CASE WHEN request_type = 'cancellation' AND ai_decision = 'cancelled' THEN 1 END) as cancellations_processed,
        AVG(processing_time) as avg_processing_time,
        SUM(amount_refunded) as total_refunded
       FROM ai_agent_logs 
       WHERE created_at >= $1`,
      [start.toISOString()]
    )
    
    return result.rows[0]
  }
}
