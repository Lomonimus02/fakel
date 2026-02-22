'use client'

import { useState } from 'react'
import { login } from '@/lib/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="w-full max-w-md p-8">
        <div className="bg-surface border border-white/10 rounded-2xl p-8">
          {/* Логотип / Заголовок */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-2xl font-bold text-white">
                IRON<span className="text-accent">RENT</span>
              </span>
            </Link>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-4 mx-auto block">
              <svg 
                className="w-8 h-8 text-dark" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
            <p className="text-text-gray mt-2">Введите пароль для входа</p>
          </div>

          {/* Форма */}
          <form action={handleSubmit}>
            <div className="space-y-6">
              {/* Поле пароля */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-text-gray mb-2"
                >
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  autoFocus
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white placeholder-text-gray"
                  placeholder="Введите пароль"
                />
              </div>

              {/* Ошибка */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </div>
              )}

              {/* Кнопка */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-dark font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Вход...
                  </>
                ) : (
                  'Войти'
                )}
              </button>
            </div>
          </form>

          {/* Подпись */}
          <p className="text-center text-xs text-text-gray mt-8">
            Planteo — Аренда спецтехники
          </p>
        </div>
      </div>
    </div>
  )
}
