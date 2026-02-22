'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Секретный ключ для JWT (в продакшене использовать переменную окружения!)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
)

const SESSION_COOKIE = 'session'
const SESSION_DURATION = 60 * 60 // 1 час в секундах

export interface SessionPayload {
  userId: number
  email: string
  isAdmin: boolean
  exp: number
}

/**
 * Создает JWT токен с указанным временем истечения
 */
async function createToken(userId: number, email: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION
  
  return new SignJWT({ userId, email, isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(exp)
    .setIssuedAt()
    .sign(JWT_SECRET)
}

/**
 * Верифицирует JWT токен и возвращает payload
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/**
 * Авторизация пользователя по паролю
 */
export async function login(formData: FormData) {
  const password = formData.get('password') as string
  
  if (!password) {
    return { error: 'Введите пароль' }
  }

  // Ищем первого админа в БД
  const user = await prisma.adminUser.findFirst()

  if (!user) {
    return { error: 'Администратор не настроен' }
  }

  // Сравниваем хеш пароля
  const isValidPassword = await bcrypt.compare(password, user.passwordHash)
  
  if (!isValidPassword) {
    return { error: 'Неверный пароль' }
  }

  // Создаём JWT токен
  const token = await createToken(user.id, user.email)
  const cookieStore = await cookies()
  
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
  
  redirect('/admin')
}

/**
 * Смена пароля администратора
 */
export async function updatePassword(formData: FormData) {
  const oldPassword = formData.get('oldPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { error: 'Заполните все поля' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Пароли не совпадают' }
  }

  if (newPassword.length < 6) {
    return { error: 'Пароль должен содержать минимум 6 символов' }
  }

  // Получаем текущего пользователя из сессии
  const session = await getSessionData()
  if (!session) {
    return { error: 'Не авторизован' }
  }

  // Получаем пользователя из БД
  const user = await prisma.adminUser.findUnique({
    where: { id: session.userId }
  })

  if (!user) {
    return { error: 'Пользователь не найден' }
  }

  // Проверяем старый пароль
  const isValidOldPassword = await bcrypt.compare(oldPassword, user.passwordHash)
  if (!isValidOldPassword) {
    return { error: 'Неверный текущий пароль' }
  }

  // Хешируем и сохраняем новый пароль
  const newPasswordHash = await bcrypt.hash(newPassword, 12)
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash }
  })

  return { success: true, message: 'Пароль успешно изменён' }
}

/**
 * Выход из системы
 */
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/login')
}

/**
 * Получение данных текущей сессии
 */
export async function getSessionData(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)
  
  if (!sessionCookie?.value) {
    return null
  }
  
  return verifyToken(sessionCookie.value)
}

/**
 * Проверка текущей сессии (boolean)
 */
export async function getSession(): Promise<boolean> {
  const session = await getSessionData()
  return session?.isAdmin === true
}

/**
 * Обновление сессии (скользящая сессия) - используется в middleware
 */
export async function refreshSession(userId: number, email: string): Promise<string> {
  return createToken(userId, email)
}
