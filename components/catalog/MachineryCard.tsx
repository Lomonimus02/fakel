'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { OptimizedImage } from '@/components/shared'
import { ArrowUpRight } from 'lucide-react'
import type { MachineWithCategory } from '@/lib/data'

// Форматирование цены
function formatPrice(price: number | string | { toString(): string }): string {
  const numPrice = typeof price === 'number' ? price : parseFloat(price.toString())
  return numPrice.toLocaleString('ru-RU')
}

// Бейдж доступности
function AvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  if (isAvailable) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded uppercase border border-green-400/20">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
        Свободен
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded uppercase border border-orange-400/20">
      Занят
    </span>
  )
}

// Парсинг badges из JSON
function parseBadges(badges: unknown): string[] {
  if (Array.isArray(badges)) {
    return badges as string[]
  }
  if (typeof badges === 'string') {
    try {
      return JSON.parse(badges)
    } catch {
      return []
    }
  }
  return []
}

// Конфигурация бейджей
const badgeConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  owner: { label: 'СОБСТВЕННИК', bgColor: 'bg-green-500', textColor: 'text-white' },
  hit: { label: 'ХИТ', bgColor: 'bg-orange-500', textColor: 'text-white' },
  new: { label: 'НОВИНКА', bgColor: 'bg-blue-500', textColor: 'text-white' },
  sale: { label: 'СКИДКА', bgColor: 'bg-red-500', textColor: 'text-white' },
}

interface MachineryCardProps {
  machine: MachineWithCategory
}

export function MachineryCard({ machine }: MachineryCardProps) {
  const searchParams = useSearchParams()
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [isHighlighted, setIsHighlighted] = useState(false)
  
  const badges = parseBadges((machine as { badges?: unknown }).badges)
  
  // EAV атрибуты: получаем ID атрибутов, которые нужно показать на карточке
  const categoryWithAttrs = machine.category as typeof machine.category & { 
    attributes?: Array<{ attributeId: number; showInCard: boolean }> 
  }
  const machineWithAttrs = machine as typeof machine & { 
    attributes?: Array<{ 
      attributeId: number; 
      valueNumber: number | null; 
      valueString: string | null;
      attribute: { name: string; unit: string | null } 
    }> 
  }
  
  const visibleAttrIds = (categoryWithAttrs.attributes || [])
    .filter(ca => ca.showInCard)
    .map(ca => ca.attributeId)
  
  const features = (machineWithAttrs.attributes || [])
    .filter(val => visibleAttrIds.includes(val.attributeId))
    .slice(0, 4) // Максимум 4 характеристики

  // Highlight логика
  useEffect(() => {
    const highlightSlug = searchParams.get('highlight')
    
    if (highlightSlug === machine.slug && cardRef.current) {
      // Скроллим к карточке
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      
      // Включаем highlight
      setIsHighlighted(true)
      
      // Убираем highlight через 3 секунды
      const timer = setTimeout(() => {
        setIsHighlighted(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams, machine.slug])

  return (
    <Link
      ref={cardRef}
      id={machine.slug}
      href={`/catalog/${machine.category.slug}/${machine.slug}`}
      className={`product-card group bg-surface rounded-xl p-6 relative overflow-hidden block transition-all duration-300 scroll-mt-24 border-2 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1 ${
        isHighlighted 
          ? 'border-accent animate-pulse-once' 
          : 'border-white/10 hover:border-accent'
      }`}
    >
      {/* Бейджи (Собственник, ХИТ и т.д.) */}
      {badges.length > 0 && (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
          {badges.map((badge) => {
            const config = badgeConfig[badge]
            if (!config) return null
            return (
              <span
                key={badge}
                className={`px-2 py-1 text-xs font-bold uppercase rounded ${config.bgColor} ${config.textColor}`}
              >
                {config.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Бейдж доступности */}
      <div className="absolute top-4 right-4 z-20">
        <AvailabilityBadge isAvailable={machine.isAvailable} />
      </div>

      {/* Изображение */}
      <div className="h-48 flex items-center justify-center relative mb-6">
        <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {machine.imageUrl ? (
          <OptimizedImage
            src={machine.imageUrl}
            alt={`Аренда ${machine.category.name} ${machine.title} в Санкт-Петербурге`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain relative z-10 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-lg">
            <span className="text-text-gray text-sm">Нет фото</span>
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="space-y-2">
        {/* Категория */}
        <span className="text-xs text-accent uppercase tracking-wider">
          {machine.category.name}
        </span>
        
        {/* Название */}
        <h3 className="font-display text-xl md:text-2xl font-bold uppercase leading-tight">
          {machine.title}
        </h3>

        {/* Характеристики (EAV атрибуты) */}
        {features.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-3">
            {features.map((feature) => {
              const value = feature.valueNumber !== null 
                ? `${feature.valueNumber}${feature.attribute.unit ? ` ${feature.attribute.unit}` : ''}`
                : feature.valueString || ''
              return (
                <div key={feature.attributeId} className="flex items-start gap-1.5 text-sm min-w-0">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0 mt-1.5"></span>
                  <div className="min-w-0">
                    <span className="text-text-gray">{feature.attribute.name}:</span>{' '}
                    <span className="text-white font-medium">{value}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Цена и кнопка */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <div>
          <span className="text-xs text-text-gray uppercase block">
            Смена (7+1)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-text-gray">от</span>
            <span className="text-2xl font-display font-bold text-accent">
              {formatPrice(machine.shiftPrice)} ₽
            </span>
          </div>
        </div>
        <span className="bg-white text-dark group-hover:bg-accent group-hover:scale-105 transition-all w-10 h-10 rounded-full flex items-center justify-center">
          <ArrowUpRight size={20} />
        </span>
      </div>
    </Link>
  )
}
