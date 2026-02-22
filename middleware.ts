import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const SESSION_COOKIE = 'session'
const SESSION_DURATION = 60 * 60 // 1 час в секундах
const REFRESH_THRESHOLD = 15 * 60 // Обновляем сессию если осталось меньше 15 минут

// Секретный ключ для JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
)

interface SessionPayload {
  userId: number
  email: string
  isAdmin: boolean
  exp: number
  iat: number
}

/**
 * Верифицирует JWT токен
 */
async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/**
 * Создает новый JWT токен
 */
async function createToken(userId: number, email: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION
  
  return new SignJWT({ userId, email, isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(exp)
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Пропускаем страницу логина
  if (pathname === '/login') {
    return NextResponse.next()
  }
  
  // Проверяем доступ к админке
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE)
    
    // Нет куки - редирект на логин
    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // Верифицируем токен
    const payload = await verifyToken(sessionCookie.value)
    
    // Токен невалиден или истек
    if (!payload) {
      const loginUrl = new URL('/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      // Удаляем невалидную куку
      response.cookies.delete(SESSION_COOKIE)
      return response
    }
    
    // Скользящая сессия: обновляем токен если осталось мало времени
    const exp = payload.exp as number
    const now = Math.floor(Date.now() / 1000)
    const timeRemaining = exp - now
    
    if (timeRemaining < REFRESH_THRESHOLD && timeRemaining > 0) {
      const newToken = await createToken(payload.userId, payload.email)
      const response = NextResponse.next()
      
      response.cookies.set(SESSION_COOKIE, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION,
        path: '/',
      })
      
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
