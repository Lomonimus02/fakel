'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Trash2, Filter, Eye, Link2, Sparkles } from 'lucide-react'
import { createCategory, updateCategory, deleteCategory, updateRelatedCategories } from '@/lib/actions/categories'
import { updateCategoryAttributes } from '@/lib/actions/attributes'
import { uploadFile } from '@/lib/actions/upload'
import { ImageUpload } from '@/components/admin'
import { generateCategorySeoTextAction } from '@/lib/actions/ai-actions'

type Attribute = {
  id: number
  name: string
  slug: string
  type: string
  unit: string | null
  _count: {
    categories: number
    values: number
  }
}

type CategoryAttribute = {
  id: number
  categoryId: number
  attributeId: number
  isFilter: boolean
  showInCard: boolean
  order: number
  attribute: {
    id: number
    name: string
    slug: string
    type: string
    unit: string | null
  }
}

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  seoTextBottom: string | null
  imageUrl: string | null
  availableFilters?: string[] | unknown
  _count: {
    machines: number
  }
}

interface SimpleCategoryInfo {
  id: number
  name: string
  _count: {
    machines: number
  }
}

interface CategoryFormProps {
  category?: Category
  allAttributes: Attribute[]
  categoryAttributes: CategoryAttribute[]
  allCategories: SimpleCategoryInfo[]
  relatedCategoryIds: number[]
}

// Состояние выбора атрибута
type AttributeSelection = {
  selected: boolean
  isFilter: boolean
  showInCard: boolean
  order: number
}

export default function CategoryForm({ category, allAttributes, categoryAttributes, allCategories, relatedCategoryIds }: CategoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiCooldown, setAiCooldown] = useState(0) // Cooldown timer in seconds
  const [seoTextBottom, setSeoTextBottom] = useState(category?.seoTextBottom || '')
  const [error, setError] = useState<string | null>(null)
  
  // Cooldown timer effect
  useEffect(() => {
    if (aiCooldown > 0) {
      const timer = setTimeout(() => setAiCooldown(aiCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [aiCooldown])
  
  // Состояние для кросс-продаж
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<number[]>(relatedCategoryIds)
  
  // Другие категории (исключая текущую)
  const otherCategories = allCategories.filter(c => c.id !== category?.id)
  
  // Инициализируем состояние атрибутов из categoryAttributes
  const initialAttributeState = () => {
    const state: Record<number, AttributeSelection> = {}
    
    // Сначала - все атрибуты не выбраны
    allAttributes.forEach(attr => {
      state[attr.id] = { selected: false, isFilter: false, showInCard: false, order: 0 }
    })
    
    // Затем - выбранные из categoryAttributes
    categoryAttributes.forEach(ca => {
      state[ca.attributeId] = {
        selected: true,
        isFilter: ca.isFilter,
        showInCard: ca.showInCard,
        order: ca.order
      }
    })
    
    return state
  }
  
  const [attributeSelections, setAttributeSelections] = useState<Record<number, AttributeSelection>>(initialAttributeState)

  const isEditing = !!category
  
  const toggleAttribute = (attributeId: number) => {
    setAttributeSelections(prev => ({
      ...prev,
      [attributeId]: {
        ...prev[attributeId],
        selected: !prev[attributeId].selected,
        // Сбрасываем isFilter и showInCard если убираем галочку
        isFilter: !prev[attributeId].selected ? prev[attributeId].isFilter : false,
        showInCard: !prev[attributeId].selected ? prev[attributeId].showInCard : false
      }
    }))
  }

  const toggleFilter = (attributeId: number) => {
    setAttributeSelections(prev => ({
      ...prev,
      [attributeId]: {
        ...prev[attributeId],
        isFilter: !prev[attributeId].isFilter
      }
    }))
  }

  const toggleShowInCard = (attributeId: number) => {
    setAttributeSelections(prev => ({
      ...prev,
      [attributeId]: {
        ...prev[attributeId],
        showInCard: !prev[attributeId].showInCard
      }
    }))
  }

  // Генерация SEO-текста через AI
  const handleGenerateSeoText = async () => {
    // Получаем название категории из формы
    const form = document.querySelector('form') as HTMLFormElement | null
    const formData = form ? new FormData(form) : new FormData()
    const categoryName = (formData.get('name') as string) || category?.name || ''
    
    if (!categoryName.trim()) {
      alert('Введите название категории перед генерацией')
      return
    }
    
    setIsGeneratingAI(true)
    try {
      // Передаём categoryId для обогащения промпта реальными данными из БД
      const result = await generateCategorySeoTextAction(categoryName, category?.id)
      
      if (result.success && result.text) {
        setSeoTextBottom(result.text)
        setAiCooldown(15) // Start 15 second cooldown
      } else {
        alert(result.error || 'Ошибка генерации SEO-текста')
      }
    } catch (error) {
      console.error('AI generation error:', error)
      alert('Ошибка при генерации SEO-текста')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Переключение связанной категории для кросс-продаж
  const toggleRelatedCategory = (categoryId: number) => {
    setSelectedRelatedIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleDelete = async () => {
    if (!category) return
    
    if (category._count.machines > 0) {
      setError(`Невозможно удалить категорию. Она содержит ${category._count.machines} единиц техники.`)
      return
    }
    
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию? Это действие необратимо.')) {
      return
    }
    
    setIsDeleting(true)
    setError(null)
    
    try {
      const result = await deleteCategory(category.id)
      if (result?.error) {
        setError(result.error)
        setIsDeleting(false)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        return
      }
      console.error('Ошибка удаления:', err)
      setError('Произошла ошибка при удалении')
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    console.log('[CategoryForm] handleSubmit CALLED!')
    console.log('[CategoryForm] Form data entries:', Array.from(formData.entries()))
    console.log('[CategoryForm] attributeSelections:', attributeSelections)
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Загружаем изображение если есть
      const imageFile = formData.get('image') as File
      let imageUrl = formData.get('currentImageUrl') as string
      
      if (imageFile && imageFile.size > 0) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageFile)
        const uploadedUrl = await uploadFile(uploadFormData)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }
      
      // Создаём FormData для категории
      const submitData = new FormData()
      submitData.append('name', formData.get('name') as string)
      submitData.append('description', formData.get('description') as string || '')
      submitData.append('seoTextBottom', formData.get('seoTextBottom') as string || '')
      submitData.append('imageUrl', imageUrl || '')
      // Сохраняем пустой массив для совместимости со старой логикой
      submitData.append('availableFilters', '[]')
      
      let result
      const categoryId = category?.id
      
      if (isEditing) {
        result = await updateCategory(category.id, submitData)
      } else {
        result = await createCategory(submitData)
        // При создании происходит redirect, атрибуты будем привязывать потом
      }
      
      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }
      
      // Сохраняем привязки атрибутов (только при редактировании)
      if (categoryId) {
        const selectedAttributes = Object.entries(attributeSelections)
          .filter(([, state]) => state.selected)
          .map(([id, state], index) => ({
            attributeId: parseInt(id),
            isFilter: state.isFilter,
            showInCard: state.showInCard,
            order: state.order || index
          }))
        
        console.log('[CategoryForm] Saving attributes for category:', categoryId)
        console.log('[CategoryForm] Selected attributes:', JSON.stringify(selectedAttributes, null, 2))
        
        const attrResult = await updateCategoryAttributes(categoryId, selectedAttributes)
        console.log('[CategoryForm] updateCategoryAttributes result:', attrResult)
        
        if (attrResult.error) {
          setError(attrResult.error)
          setIsSubmitting(false)
          return
        }
        
        // Сохраняем связанные категории для кросс-продаж
        const relatedResult = await updateRelatedCategories(categoryId, selectedRelatedIds)
        console.log('[CategoryForm] updateRelatedCategories result:', relatedResult)
        
        if (relatedResult.error) {
          setError(relatedResult.error)
          setIsSubmitting(false)
          return
        }
      }
      
      // Успешно сохранено - редирект на список категорий
      router.push('/admin/categories')
      
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        return
      }
      console.error('Ошибка сохранения:', err)
      setError('Произошла ошибка при сохранении')
      setIsSubmitting(false)
    }
  }

  // Подсчёт выбранных атрибутов
  const selectedCount = Object.values(attributeSelections).filter(s => s.selected).length
  const filterCount = Object.values(attributeSelections).filter(s => s.selected && s.isFilter).length
  const cardCount = Object.values(attributeSelections).filter(s => s.selected && s.showInCard).length

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Навигация */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </Link>
        <div className="flex items-center gap-3">
          {isEditing && (
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
            onClick={() => console.log('[CategoryForm] Submit button CLICKED!')}
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

      {/* Сообщение об ошибке */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Основная информация */}
      <div className="bg-surface rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Основная информация
        </h2>

        <div className="space-y-4">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название *
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={category?.name || ''}
              placeholder="Экскаваторы"
              className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание <span className="text-gray-500 font-normal">(необязательно)</span>
            </label>
            <textarea
              name="description"
              rows={2}
              defaultValue={category?.description || ''}
              placeholder="Краткое описание категории..."
              className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
          </div>

          {/* SEO-текст внизу страницы */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                SEO-текст внизу страницы <span className="text-gray-500 font-normal">(необязательно)</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateSeoText}
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
              name="seoTextBottom"
              rows={10}
              value={seoTextBottom}
              onChange={(e) => setSeoTextBottom(e.target.value)}
              placeholder="Статья для SEO, например: Аренда автокранов в СПБ..."
              className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y min-h-[200px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Этот текст будет отображаться внизу страницы категории (Markdown поддерживается). AI сгенерирует текст на основе названия категории.
            </p>
          </div>
        </div>
      </div>

      {/* Изображение */}
      <div className="bg-surface rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Изображение категории
        </h2>

        <ImageUpload currentImage={category?.imageUrl} name="image" />
        
        <p className="text-xs text-gray-500 mt-3">
          Рекомендуемый размер: 800x600 пикселей. Форматы: JPG, PNG, WebP.
        </p>
      </div>

      {/* Настройка характеристик (EAV) */}
      <div className="bg-surface rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Настройка характеристик
          </h2>
          <div className="text-sm text-gray-400">
            Выбрано: {selectedCount} | Фильтров: {filterCount} | На карточке: {cardCount}
          </div>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">
          Выберите характеристики, которые будут доступны для техники в этой категории.
          Включите &quot;Фильтр&quot; для параметров, по которым пользователи смогут фильтровать каталог.
        </p>
        
        {allAttributes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Атрибуты пока не созданы</p>
            <Link
              href="/admin/attributes"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium"
            >
              Создать атрибуты →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {allAttributes.map((attribute) => {
              const selection = attributeSelections[attribute.id]
              return (
                <div
                  key={attribute.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    selection?.selected 
                      ? 'bg-accent/10 border-accent/30' 
                      : 'bg-dark border-white/10 hover:border-white/20'
                  }`}
                >
                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selection?.selected || false}
                      onChange={() => toggleAttribute(attribute.id)}
                      className="w-5 h-5 bg-dark border-white/20 rounded text-accent focus:ring-accent focus:ring-offset-0"
                    />
                    <div>
                      <span className="font-medium text-white">{attribute.name}</span>
                      {attribute.unit && (
                        <span className="text-xs text-gray-500 ml-2">({attribute.unit})</span>
                      )}
                      <span className="text-xs text-gray-500 ml-2">• {attribute.type}</span>
                    </div>
                  </label>
                  
                  {/* Is Filter и Show in Card toggle (только если атрибут выбран) */}
                  {selection?.selected && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleShowInCard(attribute.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selection.showInCard
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        На карточке
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFilter(attribute.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selection.isFilter
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Filter className="w-3.5 h-3.5" />
                        Фильтр
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Кросс-продажи - связанные категории */}
      {isEditing && (
        <div className="bg-surface rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-white">
                Кросс-продажи
              </h2>
            </div>
            <div className="text-sm text-gray-400">
              Выбрано: {selectedRelatedIds.length}
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">
            Выберите категории техники, которые будут рекомендоваться на страницах товаров этой категории.
            Например: для кранов можно рекомендовать манипуляторы и шаланды.
          </p>
          
          {otherCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Нет других категорий для связи</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {otherCategories.map((cat) => {
                const isSelected = selectedRelatedIds.includes(cat.id)
                return (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-accent/10 border-accent/30' 
                        : 'bg-dark border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRelatedCategory(cat.id)}
                      className="w-5 h-5 bg-dark border-white/20 rounded text-accent focus:ring-accent focus:ring-offset-0"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-white">{cat.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({cat._count.machines} шт.)
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Информация о связанной технике */}
      {isEditing && (
        <div className="bg-surface rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Связанная техника
          </h2>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              Единиц техники в категории: <span className="text-white font-medium">{category._count.machines}</span>
            </p>
            {category._count.machines > 0 && (
              <Link
                href={`/admin/machinery?category=${category.id}`}
                className="text-accent hover:text-accent-hover transition-colors text-sm"
              >
                Посмотреть технику →
              </Link>
            )}
          </div>
        </div>
      )}
    </form>
  )
}
