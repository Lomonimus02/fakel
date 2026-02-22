'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2, FileText, Upload, X, Sparkles } from 'lucide-react'
import { saveMachine, deleteMachine } from '@/lib/actions/machine'
import { ImageUpload } from '@/components/admin'
import { uploadFile } from '@/lib/actions/upload'
import { generateTextAction } from '@/lib/actions/ai-actions'

// Типы для EAV атрибутов
interface Attribute {
  id: number
  name: string
  slug: string
  type: string
  unit: string | null
}

interface CategoryAttribute {
  id: number
  attributeId: number
  isFilter: boolean
  order: number
  attribute: Attribute
}

interface Category {
  id: number
  name: string
  slug: string
  availableFilters?: string[] | unknown
  attributes: CategoryAttribute[]
}

interface MachineAttributeValue {
  attributeId: number
  valueNumber: number | null
  valueString: string | null
  attribute: Attribute
}

interface Machine {
  id: number
  title: string
  slug: string
  categoryId: number
  shiftPrice: number
  hourlyPrice: number | null
  description: string | null
  imageUrl: string | null
  images: string[]
  specs: Record<string, string>
  isFeatured: boolean
  isAvailable: boolean
  badges: string[]
  loadChartUrl: string | null
  // Legacy параметры (для совместимости)
  liftingCapacity: number | null
  boomLength: number | null
  bucketVolume: number | null
  diggingDepth: number | null
  operatingWeight: number | null
  isAllTerrain: boolean
}

interface MachineFormProps {
  machine?: Machine
  categories: Category[]
  machineAttributes: MachineAttributeValue[]
}

export default function MachineForm({ machine, categories, machineAttributes }: MachineFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiCooldown, setAiCooldown] = useState(0) // Cooldown timer in seconds
  const [description, setDescription] = useState(machine?.description || '')
  
  // Cooldown timer effect
  useEffect(() => {
    if (aiCooldown > 0) {
      const timer = setTimeout(() => setAiCooldown(aiCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [aiCooldown])
  
  // Выбранная категория для динамических атрибутов
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    machine?.categoryId || null
  )
  
  // EAV атрибуты: { [attributeId]: { valueNumber, valueString } }
  const [attributeValues, setAttributeValues] = useState<Record<number, { valueNumber: number | null; valueString: string | null }>>(() => {
    const initial: Record<number, { valueNumber: number | null; valueString: string | null }> = {}
    machineAttributes.forEach(attr => {
      initial[attr.attributeId] = {
        valueNumber: attr.valueNumber,
        valueString: attr.valueString,
      }
    })
    return initial
  })
  
  // Получаем атрибуты для выбранной категории
  const getCategoryAttributes = (): CategoryAttribute[] => {
    if (!selectedCategoryId) return []
    const category = categories.find(c => c.id === selectedCategoryId)
    return category?.attributes || []
  }
  
  const categoryAttributes = getCategoryAttributes()
  
  // Бейджи
  const [selectedBadges, setSelectedBadges] = useState<string[]>(
    machine?.badges || []
  )
  
  // Грузовысотная схема
  const [loadChartUrl, setLoadChartUrl] = useState<string | null>(
    machine?.loadChartUrl || null
  )
  const [isUploadingChart, setIsUploadingChart] = useState(false)
  
  const badgeOptions = [
    { key: 'owner', label: 'Собственник', color: 'bg-green-500' },
    { key: 'hit', label: 'ХИТ', color: 'bg-orange-500' },
    { key: 'new', label: 'Новинка', color: 'bg-blue-500' },
    { key: 'sale', label: 'Скидка', color: 'bg-red-500' },
  ]
  
  const toggleBadge = (key: string) => {
    setSelectedBadges(prev => 
      prev.includes(key) 
        ? prev.filter(b => b !== key)
        : [...prev, key]
    )
  }
  
  // Обновление значения атрибута
  const updateAttributeValue = (attributeId: number, type: string, value: string) => {
    setAttributeValues(prev => ({
      ...prev,
      [attributeId]: {
        valueNumber: type === 'number' ? (value ? parseFloat(value) : null) : null,
        valueString: type !== 'number' ? value : null,
      }
    }))
  }
  
  // Получение текущего значения атрибута для инпута
  const getAttributeInputValue = (attributeId: number, type: string): string => {
    const val = attributeValues[attributeId]
    if (!val) return ''
    if (type === 'number') {
      return val.valueNumber !== null ? String(val.valueNumber) : ''
    }
    return val.valueString || ''
  }
  
  // Максимальный размер файла: 5 MB
  const MAX_FILE_SIZE = 5 * 1024 * 1024

  const handleChartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Клиентская валидация размера
    if (file.size > MAX_FILE_SIZE) {
      alert('Файл слишком большой. Максимум 5 МБ')
      e.target.value = ''
      return
    }
    
    setIsUploadingChart(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const url = await uploadFile(formData)
      if (url) {
        setLoadChartUrl(url)
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert('Ошибка загрузки файла')
    } finally {
      setIsUploadingChart(false)
    }
  }
  
  const removeChart = () => {
    setLoadChartUrl(null)
  }

  const handleGenerateDescription = async () => {
    setIsGeneratingAI(true)
    try {
      // Собираем данные из формы
      const form = document.querySelector('form') as HTMLFormElement | null
      const formData = form ? new FormData(form) : new FormData()
      
      const title = formData.get('title') as string || ''
      const categoryId = selectedCategoryId
      const category = categories.find(c => c.id === categoryId)
      
      // Собираем атрибуты
      const attributes = categoryAttributes.map(ca => ({
        name: ca.attribute.name,
        value: getAttributeInputValue(ca.attributeId, ca.attribute.type),
      })).filter(a => a.value)
      
      const result = await generateTextAction({
        title,
        category: category?.name,
        attributes,
      })
      
      if (result.success && result.text) {
        setDescription(result.text)
        setAiCooldown(15) // Start 15 second cooldown
      } else {
        alert(result.error || 'Ошибка генерации описания')
      }
    } catch (error) {
      console.error('AI generation error:', error)
      alert('Ошибка при генерации описания')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleDelete = async () => {
    if (!machine) return
    if (!window.confirm('Вы уверены, что хотите удалить эту технику? Это действие необратимо.')) {
      return
    }
    setIsDeleting(true)
    try {
      await deleteMachine(machine.id)
    } catch (error) {
      console.error('Ошибка удаления:', error)
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    
    // Добавляем EAV атрибуты в формData
    const productAttributes = categoryAttributes.map(ca => ({
      attributeId: ca.attributeId,
      valueNumber: attributeValues[ca.attributeId]?.valueNumber ?? null,
      valueString: attributeValues[ca.attributeId]?.valueString ?? null,
    }))
    formData.append('productAttributes', JSON.stringify(productAttributes))
    
    try {
      await saveMachine(formData)
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Скрытые поля */}
      {machine && <input type="hidden" name="id" value={machine.id} />}
      <input type="hidden" name="slug" value={machine?.slug || ''} />
      <input type="hidden" name="badges" value={JSON.stringify(selectedBadges)} />
      <input type="hidden" name="loadChartUrl" value={loadChartUrl || ''} />
      {/* Legacy: пустой specs для совместимости */}
      <input type="hidden" name="specs" value="{}" />

      {/* Навигация */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/machinery"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </Link>
        <div className="flex items-center gap-3">
          {machine && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Удалить
                </>
              )}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-dark font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Сохранить
              </>
            )}
          </button>
        </div>
      </div>

      {/* Основная информация */}
      <div className="bg-surface rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Основная информация
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Название */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название *
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={machine?.title || ''}
              placeholder="Экскаватор JCB JS220"
              className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL страницы будет сгенерирован автоматически из названия
            </p>
          </div>

          {/* Категория */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Категория *
            </label>
            <select
              name="categoryId"
              required
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="" className="bg-dark">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-dark">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Пустая ячейка */}
          <div />

          {/* Цена за смену */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Цена за смену (₽) *
            </label>
            <input
              type="number"
              name="shiftPrice"
              required
              min="0"
              step="0.01"
              defaultValue={machine?.shiftPrice || ''}
              placeholder="15000"
              className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Цена за час */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Цена за час (₽)
            </label>
            <input
              type="number"
              name="hourlyPrice"
              min="0"
              step="0.01"
              defaultValue={machine?.hourlyPrice || ''}
              placeholder="2500"
              className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        {/* Описание */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Описание
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGeneratingAI || aiCooldown > 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Генерация...
                </>
              ) : aiCooldown > 0 ? (
                <>
                  <Loader2 className="w-4 h-4" />
                  Подождите {aiCooldown}с...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Сгенерировать (AI)
                </>
              )}
            </button>
          </div>
          <textarea
            name="description"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Полное описание техники..."
            className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            AI сгенерирует описание на основе названия и характеристик. Вы сможете отредактировать текст перед сохранением.
          </p>
        </div>
      </div>

      {/* Фото */}
      <div className="bg-surface rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Главное фото
        </h2>
        <ImageUpload currentImage={machine?.imageUrl} />
      </div>

      {/* Динамические характеристики (EAV) */}
      <div className="bg-surface rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Характеристики
        </h2>
        
        {categoryAttributes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">
              {selectedCategoryId 
                ? 'Для этой категории не настроены характеристики.'
                : 'Выберите категорию, чтобы увидеть доступные характеристики.'
              }
            </p>
            {selectedCategoryId && (
              <Link
                href={`/admin/categories/${selectedCategoryId}`}
                className="text-accent hover:text-accent-hover text-sm"
              >
                Настроить характеристики категории →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryAttributes.map((ca) => (
              <div key={ca.attributeId}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {ca.attribute.name}
                  {ca.attribute.unit && (
                    <span className="text-gray-500 font-normal ml-1">({ca.attribute.unit})</span>
                  )}
                  {ca.isFilter && (
                    <span className="ml-2 text-xs text-blue-400 bg-blue-400/20 px-1.5 py-0.5 rounded">
                      фильтр
                    </span>
                  )}
                </label>
                <input
                  type={ca.attribute.type === 'number' ? 'number' : 'text'}
                  step={ca.attribute.type === 'number' ? '0.01' : undefined}
                  value={getAttributeInputValue(ca.attributeId, ca.attribute.type)}
                  onChange={(e) => updateAttributeValue(ca.attributeId, ca.attribute.type, e.target.value)}
                  placeholder={ca.attribute.type === 'number' ? '0' : 'Значение'}
                  className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Настройки отображения */}
      <div className="bg-surface rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Настройки отображения
        </h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={machine?.isFeatured || false}
              className="w-5 h-5 bg-dark border-white/20 rounded text-accent focus:ring-accent focus:ring-offset-0"
            />
            <div>
              <span className="font-medium text-white">Показывать на главной</span>
              <p className="text-sm text-gray-400">Техника будет отображаться в блоке избранного</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isAvailable"
              defaultChecked={machine?.isAvailable ?? true}
              className="w-5 h-5 bg-dark border-white/20 rounded text-accent focus:ring-accent focus:ring-offset-0"
            />
            <div>
              <span className="font-medium text-white">Доступна для аренды</span>
              <p className="text-sm text-gray-400">Отключите, если техника временно недоступна</p>
            </div>
          </label>
        </div>
      </div>

      {/* Бейджи */}
      <div className="bg-surface rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Бейджи
        </h2>
        <div className="flex flex-wrap gap-3">
          {badgeOptions.map((badge) => (
            <button
              key={badge.key}
              type="button"
              onClick={() => toggleBadge(badge.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedBadges.includes(badge.key)
                  ? `${badge.color} text-white`
                  : 'bg-dark border border-white/20 text-gray-400 hover:border-white/40'
              }`}
            >
              {badge.label}
            </button>
          ))}
        </div>
      </div>

      {/* Грузовысотная схема */}
      <div className="bg-surface rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Грузовысотная схема
        </h2>
        
        {loadChartUrl ? (
          <div className="flex items-center gap-4 p-4 bg-dark rounded-lg border border-white/10">
            <FileText className="w-8 h-8 text-accent" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">Файл загружен</p>
              <a 
                href={loadChartUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline truncate block"
              >
                {loadChartUrl}
              </a>
            </div>
            <button
              type="button"
              onClick={removeChart}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-3 p-6 bg-dark rounded-lg border-2 border-dashed border-white/20 hover:border-accent/50 cursor-pointer transition-colors">
            {isUploadingChart ? (
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-gray-400">Выберите файл (PDF, PNG, JPG)</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.pdf"
              onChange={handleChartUpload}
              disabled={isUploadingChart}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Кнопка сохранения внизу */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-dark font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Сохранить технику
            </>
          )}
        </button>
      </div>
    </form>
  )
}
