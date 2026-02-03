/**
 * Utilidades de seguridad para APIs
 * - Autenticación JWT
 * - Rate limiting simple
 * - Validación de API keys internas
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { db } from './database-postgres'

// ============================================
// RATE LIMITING (en memoria, simple)
// ============================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Rate limiter simple por IP
 * @param identifier - IP o identificador único
 * @param maxRequests - Máximo de peticiones permitidas
 * @param windowMs - Ventana de tiempo en milisegundos
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minuto por defecto
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Nueva entrada o ventana expirada
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  }
}

/**
 * Obtener IP del request
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

// ============================================
// AUTENTICACIÓN JWT
// ============================================

export interface AuthUser {
  userId: string
  email: string
}

/**
 * Extraer y verificar token JWT del request
 */
export function getAuthFromRequest(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

/**
 * Middleware: Requiere autenticación JWT
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthUser } | NextResponse> {
  const auth = getAuthFromRequest(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'No autorizado. Se requiere autenticación.' },
      { status: 401 }
    )
  }

  return { user: auth }
}

/**
 * Middleware: Requiere que el usuario autenticado coincida con el email del body
 */
export async function requireAuthMatchingEmail(
  request: NextRequest,
  email: string
): Promise<{ user: AuthUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  if (authResult.user.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: 'No autorizado. El email no coincide con el usuario autenticado.' },
      { status: 403 }
    )
  }

  return authResult
}

// ============================================
// API KEY INTERNA (para llamadas server-to-server)
// ============================================

/**
 * Verificar API key interna (para cron jobs y llamadas internas)
 */
export function verifyInternalApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-internal-api-key')
  const expectedKey = process.env.INTERNAL_API_KEY

  if (!expectedKey) {
    console.warn('⚠️ INTERNAL_API_KEY no configurada')
    return false
  }

  return apiKey === expectedKey
}

/**
 * Middleware: Requiere API key interna O autenticación JWT
 */
export async function requireInternalOrAuth(
  request: NextRequest
): Promise<{ isInternal: boolean; user?: AuthUser } | NextResponse> {
  // Primero verificar API key interna
  if (verifyInternalApiKey(request)) {
    return { isInternal: true }
  }

  // Si no hay API key, requerir autenticación JWT
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  return { isInternal: false, user: authResult.user }
}

// ============================================
// VALIDACIONES DE SEGURIDAD
// ============================================

/**
 * Verificar que el usuario tiene acceso a su propia tarjeta/suscripción
 */
export async function verifyCardOwnership(
  email: string,
  cardToken: string
): Promise<boolean> {
  const user = await db.getUserByEmail(email)
  
  if (!user) {
    return false
  }

  // El cardToken debe coincidir con el subscriptionId del usuario
  return user.subscriptionId === cardToken
}

/**
 * Rate limit response
 */
export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Demasiadas peticiones. Por favor, espera antes de intentar de nuevo.',
      retryAfter: Math.ceil(resetIn / 1000),
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(resetIn / 1000)),
      },
    }
  )
}
