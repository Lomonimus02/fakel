'use client'

import { useState, useMemo } from 'react'
import { Calculator, Loader2, MapPin, Phone, Minus, Plus, CheckCircle } from 'lucide-react'
import { submitLead } from '@/lib/actions/leads'

// ==================== ТИПЫ ====================
interface CategoryWithPrice {
  id: number
  name: string
  slug: string
  minPrice: number
}

interface LeadCalculatorProps {
  categories: CategoryWithPrice[]
}

type FieldType = 'number' | 'select'

interface CategoryField {
  label: string
  type: FieldType
  placeholder?: string
  options?: string[]
  unit?: string
}

interface CategoryFieldsConfig {
  [slug: string]: CategoryField[]
}

// ==================== КОНФИГУРАЦИЯ ПОЛЕЙ ====================
const CATEGORY_FIELDS: CategoryFieldsConfig = {
  // Автокраны / Краны
  cranes: [
    { label: 'Вес груза (макс), т', type: 'number', placeholder: '5', unit: 'т' },
    { label: 'Вылет стрелы / Высота, м', type: 'number', placeholder: '20', unit: 'м' },
  ],
  // Манипуляторы
  manipulators: [
    { label: 'Вес груза (макс), т', type: 'number', placeholder: '5', unit: 'т' },
    { label: 'Вылет стрелы / Высота, м', type: 'number', placeholder: '20', unit: 'м' },
  ],
  // Экскаваторы
  excavators: [
    { label: 'Глубина копания / Высота, м', type: 'number', placeholder: '6', unit: 'м' },
    { label: 'Объем ковша, м³', type: 'select', options: ['0.2', '0.8', '1.0', '1.5', '2.0'], unit: 'м³' },
  ],
  // Погрузчики
  loaders: [
    { label: 'Глубина копания / Высота, м', type: 'number', placeholder: '3', unit: 'м' },
    { label: 'Объем ковша, м³', type: 'select', options: ['0.2', '0.8', '1.0', '1.5', '2.0'], unit: 'м³' },
  ],
  // Самосвалы
  'dump-trucks': [
    { label: 'Объем кузова, м³', type: 'select', options: ['10', '20', '35'], unit: 'м³' },
    { label: 'Тип грунта', type: 'select', options: ['Песок', 'Щебень', 'Грунт', 'Мусор'] },
  ],
}

type PaymentType = 'cash' | 'nds'

// ==================== КОМПОНЕНТ ====================
export function LeadCalculator({ categories }: LeadCalculatorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithPrice | null>(null)
  const [address, setAddress] = useState('')
  const [shifts, setShifts] = useState(1)
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  
  // Новые состояния для умного калькулятора
  const [paymentType, setPaymentType] = useState<PaymentType>('cash')
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({})
  const [comment, setComment] = useState('')

  // Получаем конфигурацию полей для текущей категории
  const currentFields = useMemo(() => {
    if (!selectedCategory) return null
    return CATEGORY_FIELDS[selectedCategory.slug] || null
  }, [selectedCategory])

  // Расчет примерной стоимости
  const estimatedPrice = useMemo(() => {
    if (!selectedCategory) return 0
    let price = selectedCategory.minPrice * shifts
    // Безнал с НДС +22%
    if (paymentType === 'nds') {
      price = Math.round(price * 1.22)
    }
    return price
  }, [selectedCategory, shifts, paymentType])

  // При смене категории сбрасываем динамические поля
  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find(c => c.id === parseInt(categoryId))
    setSelectedCategory(cat || null)
    setDynamicFields({})
    setComment('')
  }

  // Обновление динамического поля
  const handleDynamicFieldChange = (label: string, value: string) => {
    setDynamicFields(prev => ({ ...prev, [label]: value }))
  }

  // Формирование строки специфики для CRM
  const buildSpecsString = () => {
    if (!currentFields) {
      return comment ? `Комментарий: ${comment}` : ''
    }
    const specs = currentFields
      .map(field => {
        const value = dynamicFields[field.label]
        if (!value) return null
        return `${field.label.split('/')[0].trim()}: ${value}${field.unit ? '' : ''}`
      })
      .filter(Boolean)
      .join(', ')
    return specs || ''
  }

  const handleShiftsChange = (delta: number) => {
    setShifts(prev => Math.max(1, Math.min(30, prev + delta)))
  }

  const formatPhone = (value: string) => {
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedCategory) {
      setError('Выберите категорию техники')
      return
    }

    if (!phone || phone.length < 18) {
      setError('Введите корректный номер телефона')
      return
    }

    setIsSubmitting(true)

    try {
      // Формируем сообщение для CRM
      const paymentLabel = paymentType === 'nds' ? 'Безнал с НДС' : 'Наличные'
      const specsString = buildSpecsString()
      
      const crmMessage = `КАЛЬКУЛЯТОР:
Категория: ${selectedCategory.name}
${specsString ? `Специфика: ${specsString}` : ''}
Оплата: ${paymentLabel}
Смен: ${shifts}
Адрес: ${address || 'Не указан'}
${comment ? `Комментарий: ${comment}` : ''}`

      const formData = new FormData()
      formData.append('name', 'Не указано')
      formData.append('phone', phone)
      formData.append('interest', selectedCategory.name)
      formData.append('source', 'Калькулятор на главной')
      formData.append('message', crmMessage.trim())

      const result = await submitLead(formData)

      if (result.success) {
        setCalculatedPrice(estimatedPrice)
        setIsSuccess(true)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('Произошла ошибка. Попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <section className="py-16 md:py-20 bg-dark min-h-[700px] flex items-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-accent/10 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface rounded-xl border border-green-500/30 p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              
              <p className="font-display text-2xl md:text-3xl font-bold mb-4">
                Заявка принята!
              </p>
              
              <div className="bg-dark rounded-xl p-6 mb-6">
                <p className="text-text-gray mb-2">Ориентировочная стоимость:</p>
                <div className="text-4xl md:text-5xl font-display font-bold text-accent">
                  от {calculatedPrice.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-sm text-text-gray mt-2">
                  за {shifts} {shifts === 1 ? 'смену' : shifts < 5 ? 'смены' : 'смен'}
                </p>
              </div>
              
              <p className="text-text-gray mb-6">
                Диспетчер свяжется с вами <span className="text-white font-medium">через 5 минут</span> для уточнения доставки и финальной стоимости.
              </p>

              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false)
                  setSelectedCategory(null)
                  setAddress('')
                  setShifts(1)
                  setPhone('')
                  setPaymentType('cash')
                  setDynamicFields({})
                  setComment('')
                  setCalculatedPrice(0)
                }}
                className="bg-white/10 lg:hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Повторный расчёт
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-20 bg-dark min-h-[700px] flex items-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-accent/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 px-4 py-2 rounded-full text-sm font-medium text-accent mb-4">
            <Calculator size={16} />
            Онлайн-калькулятор
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase mb-3">
            Рассчитайте стоимость{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-600">
              за 30 секунд
            </span>
          </h2>
          <p className="text-text-gray max-w-xl mx-auto">
            Выберите параметры и получите примерный расчёт.
          </p>
        </div>

        {/* Calculator Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-white/10 p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Select */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Что арендуем? *
                </label>
                <select
                  value={selectedCategory?.id || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-4 bg-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="">Выберите тип техники</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (от {cat.minPrice.toLocaleString('ru-RU')} ₽/смена)
                    </option>
                  ))}
                </select>
              </div>

              {/* Динамические поля в зависимости от категории */}
              {selectedCategory && (
                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {currentFields ? (
                    <div className="grid grid-cols-2 gap-4">
                      {currentFields.map((field, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {field.label}
                          </label>
                          {field.type === 'select' ? (
                            <select
                              value={dynamicFields[field.label] || ''}
                              onChange={(e) => handleDynamicFieldChange(field.label, e.target.value)}
                              className="w-full px-4 py-4 bg-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em' }}
                            >
                              <option value="">Выберите</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt} {field.unit || ''}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              value={dynamicFields[field.label] || ''}
                              onChange={(e) => handleDynamicFieldChange(field.label, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full px-4 py-4 bg-dark border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Если категория не в конфиге — показываем поле комментария */
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Комментарий к задаче
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Опишите вашу задачу..."
                        rows={3}
                        className="w-full px-4 py-4 bg-dark border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Способ оплаты */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Способ оплаты
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('cash')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      paymentType === 'cash'
                        ? 'bg-accent text-dark'
                        : 'bg-dark border border-white/10 text-white lg:hover:border-accent/50'
                    }`}
                  >
                    Нал
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('nds')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      paymentType === 'nds'
                        ? 'bg-accent text-dark'
                        : 'bg-dark border border-white/10 text-white lg:hover:border-accent/50'
                    }`}
                  >
                    Безнал с НДС
                  </button>
                </div>
                {paymentType === 'nds' && (
                  <p className="text-xs text-accent mt-2 animate-in fade-in duration-200">
                    +20% к стоимости
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Адрес доставки
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Санкт-Петербург, ул. Строителей, 1"
                    className="w-full pl-12 pr-4 py-4 bg-dark border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Shifts Counter */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Количество смен
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleShiftsChange(-1)}
                    disabled={shifts <= 1}
                    className="w-12 h-12 bg-dark border border-white/10 rounded-xl flex items-center justify-center text-white lg:hover:border-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={20} />
                  </button>
                  <div className="flex-1 text-center">
                    <input
                      type="number"
                      value={shifts}
                      onChange={(e) => setShifts(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                      min={1}
                      max={30}
                      className="w-full text-center text-2xl font-display font-bold bg-transparent border-none text-white focus:outline-none"
                    />
                    <div className="text-xs text-gray-500">
                      {shifts === 1 ? 'смена' : shifts < 5 ? 'смены' : 'смен'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleShiftsChange(1)}
                    disabled={shifts >= 30}
                    className="w-12 h-12 bg-dark border border-white/10 rounded-xl flex items-center justify-center text-white lg:hover:border-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ваш телефон *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full pl-12 pr-4 py-4 bg-dark border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 bg-accent lg:hover:bg-accent-hover text-dark font-display font-bold text-lg uppercase py-5 rounded-xl shadow-glow flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-pulse lg:hover:animate-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Рассчитываем...
                </>
              ) : (
                <>
                  <Calculator size={22} />
                  Получить точный расчёт
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
