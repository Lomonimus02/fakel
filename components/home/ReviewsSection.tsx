'use client'

import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Star, ChevronLeft, ChevronRight, Quote, FileText } from 'lucide-react'

interface Review {
  id: number
  author: string
  role: string | null
  text: string
  rating: number
  scanUrl: string | null
}

interface ReviewsSectionProps {
  reviews: Review[]
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  if (reviews.length === 0) {
    return null
  }

  return (
    <section id="reviews" className="scroll-mt-20 py-16 md:py-20 bg-surface">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold uppercase mb-3">
              Отзывы{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-600">
                клиентов
              </span>
            </h2>
            <p className="text-text-gray max-w-xl">
              Более 1000 успешно выполненных заказов. Читайте, что говорят о нас наши клиенты.
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="p-3 bg-dark border border-white/10 rounded-lg hover:border-accent/50 hover:bg-accent/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="p-3 bg-dark border border-white/10 rounded-lg hover:border-accent/50 hover:bg-accent/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <div className="bg-dark rounded-xl border border-white/10 p-6 h-full hover:border-accent/30 transition-colors">
                  {/* Quote Icon */}
                  <Quote className="text-accent/30 mb-4" size={32} />
                  
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                      />
                    ))}
                  </div>
                  
                  {/* Review Text */}
                  <p className="text-gray-300 leading-relaxed mb-6 line-clamp-4">
                    "{review.text}"
                  </p>
                  
                  {/* Author */}
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-white">
                          {review.author}
                        </div>
                        {review.role && (
                          <div className="text-sm text-text-gray">
                            {review.role}
                          </div>
                        )}
                      </div>
                      
                      {/* Кнопка просмотра скана */}
                      {review.scanUrl && (
                        <a
                          href={review.scanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium rounded-lg transition-colors"
                          title="Посмотреть оригинал письма"
                        >
                          <FileText size={14} />
                          <span className="hidden sm:inline">Оригинал</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dots */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-6">
          <button
            onClick={scrollPrev}
            className="p-2 bg-dark border border-white/10 rounded-lg"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={scrollNext}
            className="p-2 bg-dark border border-white/10 rounded-lg"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}
