'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import { CallbackModal } from '@/components/layout'

/**
 * In-Feed CTA блок, встраивается в середину сетки каталога.
 * Цель — перехватить пользователя, который устал скроллить,
 * и предложить помощь в подборе техники.
 */
export function CatalogCtaBlock() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="col-span-full my-2 rounded-2xl border border-accent/20 bg-gradient-to-r from-surface via-[#1a1a1a] to-surface p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Текстовая часть */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="hidden sm:flex shrink-0 w-11 h-11 items-center justify-center rounded-xl bg-accent/15">
              <Sparkles size={22} className="text-accent" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg md:text-xl font-bold uppercase leading-tight mb-1">
                Не хотите рыться в&nbsp;каталоге?
              </h3>
              <p className="text-text-gray text-sm md:text-base leading-relaxed">
                Подберём технику под вашу задачу за&nbsp;5&nbsp;минут. Бесплатно.
              </p>
            </div>
          </div>

          {/* Кнопка */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-accent lg:hover:bg-accent-hover text-dark font-bold uppercase text-sm rounded-xl transition-all duration-200 shadow-lg shadow-accent/15 lg:hover:shadow-accent/30 cursor-pointer"
          >
            Заказать подбор
            <ArrowRight size={18} className="lg:group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <CallbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source="In-Feed CTA в каталоге"
      />
    </>
  )
}
