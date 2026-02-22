'use client'

import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MobileSwiperProps {
  children: ReactNode[]
  /** Desktop grid columns (default: 3) */
  desktopCols?: 2 | 3 | 4
  /** Gap between cards in desktop grid in Tailwind units (default: 8 = 2rem) */
  desktopGap?: 6 | 8
  className?: string
}

const gridColsClass: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
}

const gapClass: Record<number, string> = {
  6: 'md:gap-6',
  8: 'md:gap-8',
}

export function MobileSwiper({
  children,
  desktopCols = 3,
  desktopGap = 8,
  className = '',
}: MobileSwiperProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const total = children.length

  const updateState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)

    // Calculate active index based on scroll position
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth
      : clientWidth
    const gap = 16 // gap-4 = 1rem = 16px
    const idx = Math.round(scrollLeft / (cardWidth + gap))
    setActiveIndex(Math.min(idx, total - 1))
  }, [total])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateState()
    el.addEventListener('scroll', updateState, { passive: true })
    window.addEventListener('resize', updateState)
    return () => {
      el.removeEventListener('scroll', updateState)
      window.removeEventListener('resize', updateState)
    }
  }, [updateState, children])

  const scrollTo = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth
      : el.clientWidth * 0.85
    const gap = 16
    const distance = cardWidth + gap
    el.scrollBy({ left: dir === 'right' ? distance : -distance, behavior: 'smooth' })
  }

  return (
    <div className={`relative ${className}`}>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={`
          flex flex-nowrap overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-2
          md:grid ${gridColsClass[desktopCols]} ${gapClass[desktopGap]} md:overflow-visible md:flex-wrap md:pb-0
        `}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="w-[calc(85vw-2rem)] sm:w-[calc(60vw-2rem)] shrink-0 snap-start md:w-auto md:min-w-0 md:shrink"
          >
            {child}
          </div>
        ))}
      </div>

      {/* Mobile nav arrows — hidden on desktop */}
      {total > 1 && (
        <div className="md:hidden">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollTo('left')}
              aria-label="Предыдущая"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-dark/80 border border-white/10 backdrop-blur-sm text-white shadow-lg active:scale-95 transition"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scrollTo('right')}
              aria-label="Следующая"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-dark/80 border border-white/10 backdrop-blur-sm text-white shadow-lg active:scale-95 transition"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-5 h-1.5 bg-accent'
                    : 'w-1.5 h-1.5 bg-white/25'
                }`}
              />
            ))}
            <span className="text-xs text-text-gray ml-2">
              {activeIndex + 1}/{total}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
