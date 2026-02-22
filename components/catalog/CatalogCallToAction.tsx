'use client'

import { useState } from 'react'
import { Phone, Truck, ArrowRight } from 'lucide-react'
import { CallbackModal } from '@/components/layout'

interface CatalogCallToActionProps {
  /** Телефон для звонка */
  phone: string
  /** Телефон для ссылки tel: (очищенный от форматирования) */
  phoneLink: string
  /** Вариант отображения: catalog (главная каталога) или category (страница категории) */
  variant?: 'catalog' | 'category'
}

const variants = {
  catalog: {
    title: 'Не хотите тратить время?',
    description: 'Не нужно изучать каталог — просто позвоните, и мы подберём оптимальный вариант под вашу задачу за 5 минут!',
    source: "Блок 'Подбор техники' в каталоге",
  },
  category: {
    title: 'Не нашли нужный вариант?',
    description: 'Возможно, мы ещё не успели добавить нужную технику на сайт. Позвоните — подберём за 5 минут!',
    source: "Блок 'Не нашли?' в категории",
  },
}

export function CatalogCallToAction({ phone, phoneLink, variant = 'category' }: CatalogCallToActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const content = variants[variant]

  return (
    <>
      <div className="mt-12 bg-gradient-to-br from-surface via-dark to-surface border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Левая часть — текст */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                  <Truck size={24} className="text-accent" />
                </div>
                <span className="text-xs uppercase tracking-wider text-accent font-semibold">
                  Подбор техники
                </span>
              </div>
              
              <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold uppercase mb-4">
                {content.title}
              </h3>
              
              <p className="text-text-gray text-base md:text-lg max-w-xl leading-relaxed">
                {content.description}
              </p>
            </div>

            {/* Правая часть — кнопки */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:min-w-[280px]">
              {/* Кнопка звонка */}
              <a
                href={`tel:${phoneLink}`}
                className="group flex items-center justify-center gap-3 px-6 py-4 bg-accent lg:hover:bg-accent-hover text-dark font-bold uppercase rounded-xl transition-all duration-200 shadow-lg shadow-accent/20 lg:hover:shadow-accent/40"
              >
                <Phone size={20} className="group-hover:animate-pulse" />
                <span className="text-sm md:text-base">Позвонить диспетчеру</span>
              </a>

              {/* Кнопка заявки */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="group flex items-center justify-center gap-3 px-6 py-4 bg-white/5 lg:hover:bg-white/10 border border-white/20 lg:hover:border-accent text-white font-bold uppercase rounded-xl transition-all duration-200"
              >
                <span className="text-sm md:text-base">Заказать подбор</span>
                <ArrowRight size={18} className="lg:group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Дополнительные преимущества */}
          <div className="grid mt-8 pt-8 border-t border-white/10 grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-accent mb-1">100+</div>
              <div className="text-sm text-text-gray">единиц техники</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-text-gray">работаем без выходных</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white mb-1">5 мин</div>
              <div className="text-sm text-text-gray">подбор техники</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white mb-1">от 2ч</div>
              <div className="text-sm text-text-gray">доставка по СПб</div>
            </div>
          </div>
        </div>
      </div>

      {/* Модалка с формой */}
      <CallbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        source={content.source}
      />
    </>
  )
}
