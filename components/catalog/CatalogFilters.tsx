'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'

// Типы для EAV
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

interface CategoryWithFilters {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  availableFilters?: unknown
  attributes?: CategoryAttribute[]
  _count: {
    machines: number
  }
}

interface CatalogFiltersProps {
  categories: CategoryWithFilters[]
  currentCategorySlug?: string // Для ЧПУ: slug категории из URL path
}

export function CatalogFilters({ categories, currentCategorySlug }: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // Локальное состояние для инпутов цены (с debounce)
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  
  // Состояние для мобильного меню
  const [isOpen, setIsOpen] = useState(false)
  
  // Текущая выбранная категория (из ЧПУ path или fallback на query параметр)
  const currentCategory = currentCategorySlug || searchParams.get('category') || ''
  
  // Получаем динамические фильтры для выбранной категории (EAV атрибуты с isFilter=true)
  const getFilterAttributes = (): CategoryAttribute[] => {
    if (!currentCategory) return []
    const selectedCat = categories.find(c => c.slug === currentCategory)
    if (!selectedCat?.attributes) return []
    return selectedCat.attributes.filter(ca => ca.isFilter)
  }
  
  const filterAttributes = getFilterAttributes()
  
  // Состояние для динамических фильтров атрибутов
  const [attrFilters, setAttrFilters] = useState<Record<string, { min: string; max: string }>>({})
  
  // Инициализация фильтров из URL при смене категории
  useEffect(() => {
    const newFilters: Record<string, { min: string; max: string }> = {}
    filterAttributes.forEach(fa => {
      const slug = fa.attribute.slug
      newFilters[slug] = {
        min: searchParams.get(`${slug}_min`) || '',
        max: searchParams.get(`${slug}_max`) || '',
      }
    })
    setAttrFilters(newFilters)
  }, [currentCategory, searchParams])

  // Создание URL с новыми параметрами
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const current = new URLSearchParams(searchParams.toString())
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          current.delete(key)
        } else {
          current.set(key, value)
        }
      })
      
      return current.toString()
    },
    [searchParams]
  )

  // Обработчик изменения категории - переход на ЧПУ
  const handleCategoryChange = (categorySlug: string) => {
    if (categorySlug === currentCategory) return
    
    // При смене категории переходим на ЧПУ URL и сбрасываем фильтры
    const params = new URLSearchParams()
    // Сохраняем только цену
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    
    const queryString = params.toString()
    const newUrl = `/catalog/${categorySlug}${queryString ? `?${queryString}` : ''}`
    
    startTransition(() => {
      router.push(newUrl)
    })
  }
  
  // Обработчик изменения фильтра атрибута
  const updateAttrFilter = (slug: string, field: 'min' | 'max', value: string) => {
    setAttrFilters(prev => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        [field]: value,
      }
    }))
  }
  
  // Применение фильтра атрибута (по blur или enter)
  const applyAttrFilter = (slug: string) => {
    const filter = attrFilters[slug]
    if (!filter) return
    
    const queryString = createQueryString({
      [`${slug}_min`]: filter.min || null,
      [`${slug}_max`]: filter.max || null,
    })
    
    startTransition(() => {
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
    })
  }

  // Debounced обновление цены
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentMin = searchParams.get('minPrice') || ''
      const currentMax = searchParams.get('maxPrice') || ''
      
      if (minPrice !== currentMin || maxPrice !== currentMax) {
        const queryString = createQueryString({
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
        })
        
        startTransition(() => {
          router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
        })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [minPrice, maxPrice, searchParams, createQueryString, pathname, router])

  // Сброс всех фильтров (кроме категории - она в pathname или будет добавлена)
  const handleReset = () => {
    setMinPrice('')
    setMaxPrice('')
    setAttrFilters({})
    
    // Если мы на ЧПУ странице категории (/catalog/[category]) - просто убираем query params
    // Если мы на корневом каталоге с ?category - сохраняем параметр category
    if (currentCategorySlug) {
      // ЧПУ: pathname уже содержит категорию
      startTransition(() => {
        router.push(pathname)
      })
    } else if (currentCategory) {
      // Legacy: категория в query params (для обратной совместимости)
      startTransition(() => {
        router.push(`${pathname}?category=${currentCategory}`)
      })
    } else {
      startTransition(() => {
        router.push(pathname)
      })
    }
  }

  // Есть ли активные фильтры
  const hasActiveFilters = minPrice || maxPrice || 
    Object.values(attrFilters).some(f => f.min || f.max) ||
    searchParams.get('q')

  // Контент фильтров
  const filtersContent = (
    <div className="space-y-6">
      {/* Категории */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase text-white mb-3">
          Категории
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                currentCategory === category.slug
                  ? 'bg-accent text-dark font-medium'
                  : 'bg-white/5 text-text-gray hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{category.name}</span>
              <span className={`text-xs ${
                currentCategory === category.slug ? 'text-dark/60' : 'text-text-gray'
              }`}>
                {category._count.machines}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Цена */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase text-white mb-3">
          Цена за смену, ₽
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="От"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-text-gray focus:outline-none focus:border-accent transition"
          />
          <input
            type="number"
            placeholder="До"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-text-gray focus:outline-none focus:border-accent transition"
          />
        </div>
      </div>

      {/* Динамические EAV фильтры */}
      {filterAttributes.map((fa) => (
        <div key={fa.attributeId}>
          <h3 className="font-display text-sm font-bold uppercase text-white mb-3">
            {fa.attribute.name}
            {fa.attribute.unit && (
              <span className="font-normal text-text-gray ml-1">({fa.attribute.unit})</span>
            )}
          </h3>
          
          {fa.attribute.type === 'number' ? (
            // Числовой фильтр - диапазон от/до
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="От"
                value={attrFilters[fa.attribute.slug]?.min || ''}
                onChange={(e) => updateAttrFilter(fa.attribute.slug, 'min', e.target.value)}
                onBlur={() => applyAttrFilter(fa.attribute.slug)}
                onKeyDown={(e) => e.key === 'Enter' && applyAttrFilter(fa.attribute.slug)}
                className="w-full min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-text-gray focus:outline-none focus:border-accent transition"
              />
              <input
                type="number"
                placeholder="До"
                value={attrFilters[fa.attribute.slug]?.max || ''}
                onChange={(e) => updateAttrFilter(fa.attribute.slug, 'max', e.target.value)}
                onBlur={() => applyAttrFilter(fa.attribute.slug)}
                onKeyDown={(e) => e.key === 'Enter' && applyAttrFilter(fa.attribute.slug)}
                className="w-full min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-text-gray focus:outline-none focus:border-accent transition"
              />
            </div>
          ) : (
            // Строковый фильтр - текстовый поиск
            <input
              type="text"
              placeholder="Поиск..."
              value={attrFilters[fa.attribute.slug]?.min || ''}
              onChange={(e) => updateAttrFilter(fa.attribute.slug, 'min', e.target.value)}
              onBlur={() => applyAttrFilter(fa.attribute.slug)}
              onKeyDown={(e) => e.key === 'Enter' && applyAttrFilter(fa.attribute.slug)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-text-gray focus:outline-none focus:border-accent transition"
            />
          )}
        </div>
      ))}

      {/* Кнопка сброса */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="w-full py-2 px-4 border border-white/10 rounded-lg text-text-gray hover:text-white hover:border-white/20 transition flex items-center justify-center gap-2"
        >
          <X size={16} />
          Сбросить фильтры
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Мобильная кнопка */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-3 px-4 bg-surface border border-white/10 rounded-lg flex items-center justify-between text-white"
        >
          <span className="flex items-center gap-2">
            <Filter size={18} />
            Фильтры
            {hasActiveFilters && (
              <span className="bg-accent text-dark text-xs px-2 py-0.5 rounded-full font-bold">
                !
              </span>
            )}
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        
        {isOpen && (
          <div className="mt-4 p-4 bg-surface border border-white/10 rounded-lg">
            {filtersContent}
          </div>
        )}
      </div>

      {/* Десктопный сайдбар */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 p-4 bg-surface border border-white/10 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold uppercase flex items-center gap-2">
              <Filter size={18} className="text-accent" />
              Фильтры
            </h2>
            {isPending && (
              <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
            )}
          </div>
          {filtersContent}
        </div>
      </aside>
    </>
  )
}
