import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db, User } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

// Generar contraseña aleatoria
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Asegurar al menos un carácter de cada tipo
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)] // minúscula
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)] // mayúscula
  password += '0123456789'[Math.floor(Math.random() * 10)] // número
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)] // símbolo
  
  // Completar con caracteres aleatorios
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Mezclar la contraseña
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Hashear contraseña
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verificar contraseña
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Generar JWT token
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// Verificar JWT token
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    return decoded
  } catch (error) {
    return null
  }
}

// Crear o actualizar usuario
export async function createOrUpdateUser(userData: {
  email: string
  userName: string
  iq?: number
  subscriptionStatus?: 'trial' | 'active' | 'cancelled' | 'expired'
  subscriptionId?: string
  trialEndDate?: string
  accessUntil?: string
}): Promise<{ user: User; password: string }> {
  const existingUser = await db.getUserByEmail(userData.email)
  
  if (existingUser) {
    // Actualizar usuario existente
    const updatedUser = await db.updateUser(existingUser.id, {
      ...userData,
      lastLogin: new Date().toISOString(),
    })
    
    if (!updatedUser) {
      throw new Error('Error actualizando usuario')
    }
    
    return { user: updatedUser, password: 'existing' }
  } else {
    // Crear nuevo usuario
    const password = generateRandomPassword()
    const hashedPassword = await hashPassword(password)
    
    const newUser = await db.createUser({
      ...userData,
      password: hashedPassword,
      subscriptionStatus: userData.subscriptionStatus || 'trial',
    })
    
    return { user: newUser, password }
  }
}

// Autenticar usuario
export async function authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const user = await db.getUserByEmail(email)
  
  if (!user) {
    return null
  }
  
  const isValidPassword = await verifyPassword(password, user.password)
  
  if (!isValidPassword) {
    return null
  }
  
  // Actualizar último login
  await db.updateUser(user.id, {
    lastLogin: new Date().toISOString(),
  })
  
  const token = generateToken(user.id, user.email)
  
  return { user, token }
}

// Cambiar contraseña
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  const user = await db.getUserById(userId)
  
  if (!user) {
    return false
  }
  
  const isValidCurrentPassword = await verifyPassword(currentPassword, user.password)
  
  if (!isValidCurrentPassword) {
    return false
  }
  
  const hashedNewPassword = await hashPassword(newPassword)
  
  await db.updateUser(userId, {
    password: hashedNewPassword,
  })
  
  return true
}

// Resetear contraseña
export async function resetPassword(email: string, newPassword: string): Promise<boolean> {
  const user = await db.getUserByEmail(email)
  
  if (!user) {
    return false
  }
  
  const hashedPassword = await hashPassword(newPassword)
  
  await db.updateUser(user.id, {
    password: hashedPassword,
  })
  
  return true
}

// Generar token de reset de contraseña
export function generatePasswordResetToken(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Middleware para verificar autenticación
export function requireAuth(token: string | undefined): { userId: string; email: string } | null {
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}
