'use client'

import { useState, useCallback, useEffect, useRef, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { searchProducts, findCategoryByName, type SearchResult } from '@/lib/actions/search'

// Хук дебаунса
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

interface SearchBarProps {
  className?: string
  placeholder?: string
  variant?: 'default' | 'compact' | 'collapsible'
  onSearch?: () => void
}

export function SearchBar({ 
  className = '', 
  placeholder = 'Поиск техники...', 
  variant = 'default',
  onSearch
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Состояния
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Рефы
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isUserTypingRef = useRef(false) // Отслеживаем, вводит ли пользователь сам
  
  // Дебаунс запроса
  const debouncedQuery = useDebounce(query, 300)

  // Синхронизируем с URL при навигации (без открытия dropdown)
  useEffect(() => {
    isUserTypingRef.current = false
    setQuery(searchParams.get('q') || '')
    setIsOpen(false)
    setResults([])
    setIsExpanded(false)
  }, [searchParams])

  // Live search только при пользовательском вводе
  useEffect(() => {
    // Не делаем live search если это не пользовательский ввод
    if (!isUserTypingRef.current) {
      return
    }
    
    const performSearch = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await searchProducts(debouncedQuery)
        setResults(searchResults)
        setIsOpen(searchResults.length > 0)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        if (variant === 'collapsible') {
          setIsExpanded(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [variant])

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
        if (variant === 'collapsible') {
          setIsExpanded(false)
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [variant])

  const handleSearch = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    
    // Закрываем проактивный поиск
    setIsOpen(false)
    setResults([])
    inputRef.current?.blur()
    
    // Callback для закрытия мобильного меню
    onSearch?.()
    
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    
    // Умный редирект: проверяем, совпадает ли запрос с названием категории
    const categoryMatch = await findCategoryByName(trimmedQuery)
    
    if (categoryMatch) {
      // Если найдена категория - переходим на её страницу
      router.push(`/catalog/${categoryMatch.slug}`)
      return
    }
    
    // Если категория не найдена - глобальный поиск
    router.push(`/catalog?q=${encodeURIComponent(trimmedQuery)}`)
    
    // Скроллим к результатам после небольшой задержки
    setTimeout(() => {
      const resultsSection = document.getElementById('catalog-results')
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }, [query, router, onSearch])

  const handleClear = useCallback(() => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    // Только очищаем поле, БЕЗ навигации
  }, [])

  // Закрытие дропдауна при навигации
  const handleResultClick = useCallback(() => {
    setIsOpen(false)
    setResults([])
    // Callback для закрытия мобильного меню
    onSearch?.()
  }, [onSearch])

  // Форматирование цены
  const formatPrice = (price: number) => price.toLocaleString('ru-RU')

  const isCompact = variant === 'compact'
  const isCollapsible = variant === 'collapsible'

  // Обработчик клика на иконку поиска для collapsible варианта
  const handleSearchIconClick = () => {
    setIsExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Collapsible вариант - flow-based с анимацией ширины
  if (isCollapsible) {
    return (
      <div 
        ref={containerRef} 
        className={`relative transition-all duration-300 ease-out ${isExpanded ? className : 'w-10'}`}
      >
        {/* Свёрнутое состояние - иконка поиска */}
        {!isExpanded && (
          <button
            onClick={handleSearchIconClick}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-white/10 hover:border-accent hover:text-accent transition-all"
            aria-label="Открыть поиск"
          >
            <Search size={20} />
          </button>
        )}
        
        {/* Развёрнутое состояние - полная форма поиска */}
        {isExpanded && (
          <form 
            onSubmit={handleSearch}
            className="flex items-stretch bg-surface border rounded-lg overflow-hidden transition-all duration-200 border-white/10 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent"
            style={{ animation: 'searchFadeIn 0.2s ease-out' }}
          >
            <style>{`
              @keyframes searchFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
            <div className="relative flex-1">
              {isLoading ? (
                <Loader2 
                  size={16} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-accent animate-spin pointer-events-none z-10" 
                />
              ) : (
                <Search 
                  size={16} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-gray pointer-events-none z-10" 
                />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  isUserTypingRef.current = true
                  setQuery(e.target.value)
                }}
                onFocus={() => results.length > 0 && setIsOpen(true)}
                placeholder={placeholder}
                autoComplete="off"
                className="w-full h-full bg-transparent border-none text-white placeholder-text-gray focus:outline-none focus:ring-0 pl-9 pr-8 py-2 text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-gray hover:text-white transition-colors z-10"
                  aria-label="Очистить поиск"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-dark font-bold uppercase transition-colors flex-shrink-0 px-4 text-xs"
            >
              Найти
            </button>
          </form>
        )}
        
        {/* Выпадающий список результатов */}
        {isExpanded && isOpen && results.length > 0 && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 bg-dark border border-accent/30 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
            style={{ animation: 'dropdownFadeIn 0.15s ease-out', minWidth: '100%' }}
          >
            <style>{`
              @keyframes dropdownFadeIn {
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div className="px-4 py-2 border-b border-white/10 bg-surface/50">
              <p className="text-xs text-text-gray uppercase tracking-wider">Найдено: {results.length}</p>
            </div>
            <ul>
              {results.map((result, index) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => {
                      handleResultClick()
                      router.push(`/catalog/${result.categorySlug}?highlight=${result.slug}#${result.slug}`)
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-accent/10 transition-all duration-200 group border-b border-white/5 last:border-b-0 text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10 group-hover:border-accent/30 transition-colors">
                      {result.imageUrl ? (
                        <img src={result.imageUrl} alt={result.title} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-lg font-bold text-accent/50">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm leading-tight group-hover:text-accent transition-colors">{result.title}</p>
                      <p className="text-xs text-text-gray mt-0.5">{result.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <p className="text-[10px] text-text-gray uppercase">от</p>
                      <p className="text-accent font-bold text-lg leading-none">{formatPrice(result.shiftPrice)} <span className="text-sm">₽</span></p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/10 p-3 bg-surface/30">
              <button
                type="button"
                onClick={() => {
                  handleResultClick()
                  router.push(`/catalog?q=${encodeURIComponent(query.trim())}`)
                }}
                className="w-full text-center text-sm font-semibold text-accent hover:text-white bg-accent/10 hover:bg-accent py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Search size={16} />
                Показать все результаты
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form 
        onSubmit={handleSearch}
        className={`
          flex items-stretch bg-surface border rounded-lg overflow-hidden
          transition-all duration-200
          border-white/10 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent
        `}
      >
        <div className="relative flex-1">
          {isLoading ? (
            <Loader2 
              size={isCompact ? 16 : 20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-accent animate-spin pointer-events-none z-10" 
            />
          ) : (
            <Search 
              size={isCompact ? 16 : 20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-gray pointer-events-none z-10" 
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              isUserTypingRef.current = true
              setQuery(e.target.value)
            }}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            className={`
              w-full h-full bg-transparent border-none
              text-white placeholder-text-gray
              focus:outline-none focus:ring-0
              ${isCompact ? 'pl-9 pr-8 py-2 text-sm' : 'pl-11 pr-10 py-3'}
            `}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-gray hover:text-white transition-colors z-10"
              aria-label="Очистить поиск"
            >
              <X size={isCompact ? 14 : 18} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className={`
            bg-accent hover:bg-accent-hover text-dark font-bold uppercase
            transition-colors flex-shrink-0
            ${isCompact ? 'px-4 text-xs' : 'px-6 text-sm'}
          `}
        >
          Найти
        </button>
      </form>

      {/* Выпадающий список результатов — улучшенный дизайн */}
      {isOpen && results.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-dark border border-accent/30 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
          style={{ animation: 'dropdownFadeIn 0.15s ease-out', minWidth: '100%' }}
        >
          <style>{`
            @keyframes dropdownFadeIn {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {/* Заголовок */}
          <div className="px-4 py-2 border-b border-white/10 bg-surface/50">
            <p className="text-xs text-text-gray uppercase tracking-wider">Найдено: {results.length}</p>
          </div>
          
          <ul>
            {results.map((result, index) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => {
                    handleResultClick()
                    // Перенаправляем в категорию с подсветкой товара
                    router.push(`/catalog/${result.categorySlug}?highlight=${result.slug}#${result.slug}`)
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-accent/10 transition-all duration-200 group border-b border-white/5 last:border-b-0 text-left"
                >
                  {/* Номер / Миниатюра */}
                  <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10 group-hover:border-accent/30 transition-colors">
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt={result.title}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-lg font-bold text-accent/50">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight group-hover:text-accent transition-colors">
                      {result.title}
                    </p>
                    <p className="text-xs text-text-gray mt-0.5">{result.category}</p>
                  </div>
                  
                  {/* Цена */}
                  <div className="text-right flex-shrink-0 pl-2">
                    <p className="text-[10px] text-text-gray uppercase">от</p>
                    <p className="text-accent font-bold text-lg leading-none">{formatPrice(result.shiftPrice)} <span className="text-sm">₽</span></p>
                  </div>
                  
                  {/* Стрелка */}
                  <div className="w-6 h-6 rounded-full bg-white/5 group-hover:bg-accent flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                    <svg className="w-3 h-3 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          
          {/* Ссылка на все результаты */}
          <div className="border-t border-white/10 p-3 bg-surface/30">
            <button
              type="button"
              onClick={() => {
                handleResultClick()
                router.push(`/catalog?q=${encodeURIComponent(query.trim())}`)
              }}
              className="w-full text-center text-sm font-semibold text-accent hover:text-white bg-accent/10 hover:bg-accent py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Search size={16} />
              Показать все результаты
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
