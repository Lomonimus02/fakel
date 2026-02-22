'use client'

import { useState } from 'react'
import { updatePassword } from '@/lib/auth'
import { Key, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)

    const result = await updatePassword(formData)

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Пароль изменён' })
      // Очищаем форму
      const form = document.getElementById('password-form') as HTMLFormElement
      form?.reset()
    } else {
      setMessage({ type: 'error', text: result.error || 'Ошибка' })
    }

    setIsLoading(false)
  }

  function toggleShowPassword(field: 'old' | 'new' | 'confirm') {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-xl mx-auto py-8 px-4">
        {/* Шапка */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Профиль</h1>
            <p className="text-gray-400 mt-1">Смена пароля администратора</p>
          </div>
        </div>

      {/* Сообщение */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Форма смены пароля */}
      <div className="bg-surface border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-accent" />
          Смена пароля
        </h2>

        <form id="password-form" action={handleSubmit} className="space-y-4">
          {/* Старый пароль */}
          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">
              Текущий пароль
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                name="oldPassword"
                required
                className="w-full px-4 py-3 pr-12 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white"
                placeholder="Введите текущий пароль"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('old')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-gray hover:text-white transition-colors"
              >
                {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Новый пароль */}
          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">
              Новый пароль
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white"
                placeholder="Минимум 6 символов"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-gray hover:text-white transition-colors"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Подтверждение */}
          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">
              Повторите новый пароль
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white"
                placeholder="Повторите пароль"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-gray hover:text-white transition-colors"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-dark font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark"></div>
                  Сохранение...
                </>
              ) : (
                'Сменить пароль'
              )}
            </button>
            
            
          </div>
        </form>
      </div>

      {/* Информация */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-400">
          <strong>Важно:</strong> После смены пароля вам нужно будет заново войти в систему с новым паролем.
        </p>
      </div>
      </div>
    </div>
  )
}
