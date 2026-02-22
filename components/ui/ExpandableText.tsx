'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'

interface ExpandableTextProps {
  children: ReactNode
  maxHeight?: string
}

/**
 * Компонент для скрытия длинных SEO-текстов с кнопкой "Читать далее".
 * Текст всегда присутствует в DOM для индексации поисковиками.
 */
export function ExpandableText({ 
  children, 
  maxHeight = '250px' 
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number | null>(null)

  // Измеряем реальную высоту контента для плавной анимации
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [children])

  const collapsedHeight = parseInt(maxHeight, 10) || 250
  const expandedHeight = contentHeight || 2000

  return (
    <div className="relative">
      {/* Контейнер с текстом */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight: isExpanded ? `${expandedHeight}px` : `${collapsedHeight}px` }}
      >
        {children}
      </div>

      {/* Градиент — всегда в DOM, плавно появляется/исчезает */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent pointer-events-none transition-opacity duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Кнопка — фиксированная позиция, плавный transition */}
      <div className="flex justify-center mt-4 relative z-10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-6 py-2 bg-surface border border-white/10 rounded-full text-sm text-text-gray hover:text-white hover:border-accent transition-colors duration-200"
        >
          {isExpanded ? 'Скрыть ↑' : 'Читать далее ↓'}
        </button>
      </div>
    </div>
  )
}
