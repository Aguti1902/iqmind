/**
 * Sistema de detección de fraude para proteger contra abuso
 * CRÍTICO: Este sistema es esencial para evitar disputas y cierres de cuenta
 */

import { db } from './database-postgres'

// Configuración de límites
const FRAUD_CONFIG = {
  // Límites de test por IP
  maxTestsPerIP: 3,                    // Máximo 3 tests por IP en 24h
  maxTestsPerIPWeek: 5,                // Máximo 5 tests por IP en 7 días
  
  // Tiempo del test
  minTimeToComplete: 180,              // Mínimo 3 minutos (180 segundos)
  maxTimeToComplete: 3600,             // Máximo 1 hora (3600 segundos)
  
  // Emails sospechosos
  blockedEmailDomains: [
    'tempmail.com',
    'guerrillamail.com',
    'mailinator.com',
    '10minutemail.com',
    'throwaway.email',
    'yopmail.com'
  ],
  
  // Países con alto riesgo (opcional, usar con cuidado)
  blockedCountries: [] as string[],    // Ej: ['NG', 'PK'] - DESACTIVADO por defecto
  
  // Patrones sospechosos
  suspiciousPatterns: {
    tooManyCorrect: 40,                // Si responde 40+ correctas = bot
    tooManyWrong: 45,                  // Si responde 45+ incorrectas = spam
    sameAnswerPattern: 0.8,            // 80% de respuestas iguales = bot
  },
  
  // Límites de compra
  maxPurchasesPerEmail: 1,             // Solo 1 compra por email
  maxPurchasesPerIP: 2,                // Máximo 2 compras por IP
}

interface TestData {
  answers: (number | null)[]
  timeElapsed: number
  correctAnswers: number
  categoryScores: Record<string, number>
}

interface FraudCheckResult {
  isValid: boolean
  risk: 'low' | 'medium' | 'high' | 'critical'
  reasons: string[]
  shouldBlock: boolean
}

/**
 * Validar si un test es sospechoso de ser fraudulento
 */
export async function checkTestFraud(testData: TestData, ip: string): Promise<FraudCheckResult> {
  const reasons: string[] = []
  let risk: 'low' | 'medium' | 'high' | 'critical' = 'low'
  let shouldBlock = false

  // 1. Verificar tiempo de completado
  if (testData.timeElapsed < FRAUD_CONFIG.minTimeToComplete) {
    reasons.push(`Test completado muy rápido: ${testData.timeElapsed}s (mínimo: ${FRAUD_CONFIG.minTimeToComplete}s)`)
    risk = 'critical'
    shouldBlock = true
  }

  if (testData.timeElapsed > FRAUD_CONFIG.maxTimeToComplete) {
    reasons.push(`Test tomó demasiado tiempo: ${testData.timeElapsed}s`)
    risk = 'medium'
  }

  // 2. Verificar patrones de respuesta
  const { correctAnswers, answers } = testData

  // Bot detectado: demasiadas correctas
  if (correctAnswers > FRAUD_CONFIG.suspiciousPatterns.tooManyCorrect) {
    reasons.push(`Demasiadas respuestas correctas: ${correctAnswers} (posible bot)`)
    risk = 'critical'
    shouldBlock = true
  }

  // Spam: demasiadas incorrectas
  if (correctAnswers < 5 && answers.length > FRAUD_CONFIG.suspiciousPatterns.tooManyWrong) {
    reasons.push('Patrón de spam: casi todas incorrectas')
    risk = 'high'
  }

  // 3. Detectar patrón de respuesta repetida
  const answerCounts: Record<number, number> = {}
  let maxCount = 0
  
  answers.forEach(answer => {
    if (answer !== null) {
      answerCounts[answer] = (answerCounts[answer] || 0) + 1
      maxCount = Math.max(maxCount, answerCounts[answer])
    }
  })

  const totalAnswers = answers.filter(a => a !== null).length
  const repetitionRate = totalAnswers > 0 ? maxCount / totalAnswers : 0

  if (repetitionRate > FRAUD_CONFIG.suspiciousPatterns.sameAnswerPattern) {
    reasons.push(`Patrón de respuesta repetida: ${(repetitionRate * 100).toFixed(0)}% iguales`)
    risk = 'critical'
    shouldBlock = true
  }

  // 4. Verificar límite de tests por IP (requerir implementación en BD)
  // TODO: Implementar tracking de IPs en base de datos
  
  if (risk === 'low') {
    reasons.push('Test válido')
  }

  return {
    isValid: !shouldBlock,
    risk,
    reasons,
    shouldBlock
  }
}

/**
 * Validar email antes del pago
 */
export async function checkEmailFraud(email: string, ip: string): Promise<FraudCheckResult> {
  const reasons: string[] = []
  let risk: 'low' | 'medium' | 'high' | 'critical' = 'low'
  let shouldBlock = false

  // 1. Verificar dominio de email temporal
  const domain = email.split('@')[1]?.toLowerCase()
  
  if (FRAUD_CONFIG.blockedEmailDomains.includes(domain)) {
    reasons.push(`Email temporal detectado: ${domain}`)
    risk = 'critical'
    shouldBlock = true
  }

  // 2. Verificar si el email ya tiene una compra
  const existingUser = await db.getUserByEmail(email)
  
  if (existingUser && existingUser.subscriptionId) {
    reasons.push('Email ya tiene una suscripción activa')
    risk = 'high'
    shouldBlock = true
  }

  // 3. Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    reasons.push('Formato de email inválido')
    risk = 'high'
    shouldBlock = true
  }

  if (risk === 'low') {
    reasons.push('Email válido')
  }

  return {
    isValid: !shouldBlock,
    risk,
    reasons,
    shouldBlock
  }
}

/**
 * Check completo antes de permitir el pago
 */
export async function validateBeforePayment(
  email: string,
  testData: TestData,
  ip: string
): Promise<FraudCheckResult> {
  console.log('🔍 [FRAUD] Validando antes del pago...')
  console.log(`   Email: ${email}`)
  console.log(`   IP: ${ip}`)
  console.log(`   Time: ${testData.timeElapsed}s`)
  console.log(`   Correct: ${testData.correctAnswers}`)

  // Check email
  const emailCheck = await checkEmailFraud(email, ip)
  if (emailCheck.shouldBlock) {
    console.log('❌ [FRAUD] Email bloqueado:', emailCheck.reasons)
    return emailCheck
  }

  // Check test
  const testCheck = await checkTestFraud(testData, ip)
  if (testCheck.shouldBlock) {
    console.log('❌ [FRAUD] Test bloqueado:', testCheck.reasons)
    return testCheck
  }

  console.log('✅ [FRAUD] Validación exitosa')

  return {
    isValid: true,
    risk: 'low',
    reasons: ['Validación exitosa'],
    shouldBlock: false
  }
}

/**
 * Logging de intentos fraudulentos para análisis
 */
export async function logFraudAttempt(
  email: string,
  ip: string,
  reasons: string[],
  risk: string
): Promise<void> {
  try {
    // Log en consola (en producción, guardar en BD)
    console.warn('⚠️ [FRAUD] Intento sospechoso detectado:')
    console.warn(`   Email: ${email}`)
    console.warn(`   IP: ${ip}`)
    console.warn(`   Risk: ${risk}`)
    console.warn(`   Reasons:`, reasons)
    
    // TODO: Guardar en tabla fraud_attempts en BD para análisis
    // await db.logFraudAttempt({ email, ip, reasons, risk, timestamp: new Date() })
  } catch (error) {
    console.error('Error logging fraud attempt:', error)
  }
}

/**
 * Obtener IP real del usuario (considerando proxies y CDN)
 */
export function getRealIP(request: Request): string {
  // Intentar obtener IP de headers comunes
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const cfConnecting = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (cfConnecting) return cfConnecting
  if (real) return real
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return 'unknown'
}

/**
 * Calcular score de riesgo (0-100)
 */
export function calculateRiskScore(checks: FraudCheckResult[]): number {
  let score = 0
  
  checks.forEach(check => {
    switch (check.risk) {
      case 'critical':
        score += 40
        break
      case 'high':
        score += 25
        break
      case 'medium':
        score += 15
        break
      case 'low':
        score += 5
        break
    }
  })
  
  return Math.min(100, score)
}

