'use client'

import { useState, useRef, useTransition } from 'react'
import { Loader2, CheckCircle, Phone, ArrowRight } from 'lucide-react'
import { submitLead } from '@/lib/actions/leads'

/**
 * Форматирование телефона в формат +7 (XXX) XXX-XX-XX
 */
function formatPhone(value: string): string {
  // Удаляем всё кроме цифр
  const digits = value.replace(/\D/g, '')
  
  // Форматируем как +7 (XXX) XXX-XX-XX
  if (digits.length === 0) return ''
  if (digits.length <= 1) return '+7'
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
}

// Варианты техники для селекта
const INTEREST_OPTIONS = [
  { value: '', label: 'Не знаю / Консультация' },
  { value: 'Автокран', label: 'Автокран' },
  { value: 'Манипулятор', label: 'Манипулятор' },
  { value: 'Автовышка', label: 'Автовышка' },
  { value: 'Экскаватор', label: 'Экскаватор' },
  { value: 'Погрузчик', label: 'Погрузчик' },
  { value: 'Самосвал', label: 'Самосвал' },
]

// Техника, для которой нужны поля "Вес груза" и "Высота подъёма"
// (краны, манипуляторы, автовышки — всё, что поднимает грузы)
const LIFTING_MACHINERY = ['Автокран', 'Манипулятор', 'Автовышка']

// Варианты типа работ
const TASK_TYPE_OPTIONS = [
  { value: '', label: 'Выберите тип работ' },
  { value: 'Монтаж', label: 'Монтаж' },
  { value: 'Погрузка', label: 'Погрузка' },
  { value: 'Земляные работы', label: 'Земляные работы' },
  { value: 'Демонтаж', label: 'Демонтаж' },
  { value: 'Перемещение грузов', label: 'Перемещение грузов' },
  { value: 'Другое', label: 'Другое' },
]

interface LeadFormProps {
  /** Источник заявки (например: "Главная - Hero", "Модалка в шапке") */
  source: string
  /** Название техники (если заявка со страницы товара) */
  machineName?: string
  /** Предвыбранный интерес (например: "Экскаватор") */
  initialInterest?: string | null
  /** Вариант отображения */
  variant?: 'default' | 'compact' | 'inline'
  /** Режим формы: emergency — только телефон и кнопка для срочных вызовов, compact — телефон и кнопка компактно */
  mode?: 'default' | 'emergency' | 'compact'
  /** Текст кнопки */
  buttonText?: string
  /** Показывать поле комментария */
  showMessage?: boolean
  /** Показывать поле имени (по умолчанию true) */
  showName?: boolean
  /** Показывать поле выбора техники (по умолчанию true) */
  showInterest?: boolean
  /** Показывать поле типа работ (по умолчанию true) */
  showTaskType?: boolean
  /** Показывать поле email (по умолчанию true) */
  showEmail?: boolean
  /** Callback после успешной отправки */
  onSuccess?: () => void
  /** Дополнительные классы */
  className?: string
}

export function LeadForm({
  source,
  machineName,
  initialInterest,
  variant = 'default',
  mode = 'default',
  buttonText = 'Отправить заявку',
  showMessage = true,
  showName = true,
  showInterest = true,
  showTaskType = true,
  showEmail = true,
  onSuccess,
  className = '',
}: LeadFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedInterest, setSelectedInterest] = useState(initialInterest || '')
  const [phone, setPhone] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    // Проверяем корректность телефона
    if (phone.length < 18) {
      setError('Введите корректный номер телефона')
      return
    }
    
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const response = await submitLead(formData)
      
      if (response.success) {
        setIsSuccess(true)
        setPhone('')
        formRef.current?.reset()
        onSuccess?.()
      } else {
        setError(response.error)
      }
    })
  }

  // Успешное состояние
  if (isSuccess) {
    return (
      <div className={`bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center ${className}`}>
        <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
        <h3 className="font-display text-xl font-bold mb-2">Спасибо за заявку!</h3>
        <p className="text-text-gray">
          Мы перезвоним вам в течение 5 минут
        </p>
        {machineName && (
          <p className="text-sm text-accent mt-2">
            Техника: {machineName}
          </p>
        )}
      </div>
    )
  }

  // Compact mode — телефон и кнопка в компактном виде
  if (mode === 'compact') {
    return (
      <form ref={formRef} onSubmit={handleSubmit} className={className}>
        <input type="hidden" name="source" value={source} />
        <input type="hidden" name="name" value="Быстрая заявка" />
        {machineName && <input type="hidden" name="machine" value={machineName} />}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="tel"
              name="phone"
              placeholder="+7 (___) ___-__-__"
              required
              value={phone}
              onChange={handlePhoneChange}
              disabled={isPending}
              className="w-full pl-10 pr-4 py-3 bg-dark/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-accent hover:bg-accent-hover text-dark font-bold uppercase py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {buttonText}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
        
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
        
        <p className="text-xs text-gray-500 text-center mt-3">
          Перезвоним в течение 5 минут
        </p>
      </form>
    )
  }

  // Emergency mode — только телефон и кнопка
  if (mode === 'emergency') {
    return (
      <form ref={formRef} onSubmit={handleSubmit} className={className}>
        <input type="hidden" name="source" value="Блок Горит объект" />
        <input type="hidden" name="name" value="СРОЧНЫЙ ВЫЗОВ" />
        <input type="hidden" name="interest" value="СРОЧНЫЙ ВЫЗОВ" />
        
        {/* Крупное поле телефона */}
        <div className="relative mb-4">
          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
          <input
            type="tel"
            name="phone"
            placeholder="+7 (___) ___-__-__"
            required
            value={phone}
            onChange={handlePhoneChange}
            disabled={isPending}
            className="w-full pl-14 pr-4 py-5 bg-dark/80 border border-white/20 rounded-xl text-white text-xl font-medium placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all disabled:opacity-50"
          />
        </div>
        
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}
        
        {/* Желтая кнопка в фирменном стиле */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-accent hover:bg-accent-hover text-dark font-display font-bold uppercase text-lg py-5 rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isPending ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Отправляем...
            </>
          ) : (
            <>
              {buttonText}
              <ArrowRight size={24} />
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          Перезвоним через 3 минуты
        </p>
      </form>
    )
  }

  // Компактный вариант (только имя и телефон в ряд)
  if (variant === 'compact') {
    return (
      <form ref={formRef} onSubmit={handleSubmit} className={className}>
        <input type="hidden" name="source" value={source} />
        {machineName && <input type="hidden" name="machine" value={machineName} />}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            name="name"
            placeholder="Ваше имя"
            required
            minLength={2}
            disabled={isPending}
            className="flex-1 bg-dark/50 border border-white/20 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors disabled:opacity-50"
          />
          <input
            type="tel"
            name="phone"
            placeholder="+7 (___) ___-__-__"
            required
            value={phone}
            onChange={handlePhoneChange}
            disabled={isPending}
            className="flex-1 bg-dark/50 border border-white/20 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-accent hover:bg-accent-hover text-dark font-bold uppercase py-3 px-6 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              buttonText
            )}
          </button>
        </div>
        
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </form>
    )
  }

  // Инлайн вариант (горизонтальный)
  if (variant === 'inline') {
    return (
      <form ref={formRef} onSubmit={handleSubmit} className={className}>
        <input type="hidden" name="source" value={source} />
        {machineName && <input type="hidden" name="machine" value={machineName} />}
        
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            name="name"
            placeholder="Имя"
            required
            minLength={2}
            disabled={isPending}
            className="w-32 bg-dark/50 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm disabled:opacity-50"
          />
          <input
            type="tel"
            name="phone"
            placeholder="+7 (___) ___-__-__"
            required
            value={phone}
            onChange={handlePhoneChange}
            disabled={isPending}
            className="w-44 bg-dark/50 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-accent hover:bg-accent-hover text-dark font-bold uppercase py-2 px-4 rounded text-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
            {isPending ? '...' : 'Позвоните мне'}
          </button>
        </div>
        
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </form>
    )
  }

  // Дефолтный вариант (упрощённая форма — только телефон и комментарий)
  return (
    <form ref={formRef} onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <input type="hidden" name="source" value={source} />
      {machineName && <input type="hidden" name="machine" value={machineName} />}

      {/* Телефон — крупное поле */}
      <div className="relative">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={22} />
        <input
          type="tel"
          name="phone"
          placeholder="Ваш телефон *"
          required
          value={phone}
          onChange={handlePhoneChange}
          disabled={isPending}
          className="w-full pl-12 pr-4 py-5 bg-dark/50 border border-white/20 rounded-lg text-lg text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all disabled:opacity-50"
        />
      </div>

      {/* Комментарий */}
      {showMessage && (
        <div>
          <textarea
            name="message"
            placeholder="Комментарий к задаче (необязательно)"
            rows={3}
            disabled={isPending}
            className="w-full bg-dark/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none disabled:opacity-50"
          />
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Кнопка — массивная */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-accent hover:bg-accent-hover text-dark font-display font-bold uppercase text-lg py-5 rounded-lg shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isPending ? (
          <>
            <Loader2 size={24} className="animate-spin" />
            Отправка...
          </>
        ) : (
          <>
            {buttonText}
            <ArrowRight size={22} />
          </>
        )}
      </button>

      {/* Политика */}
      <p className="text-xs text-gray-600 text-center">
        Нажимая кнопку, вы соглашаетесь с{' '}
        <a href="/terms" className="text-accent hover:underline">
          политикой конфиденциальности
        </a>
      </p>
    </form>
  )
}
