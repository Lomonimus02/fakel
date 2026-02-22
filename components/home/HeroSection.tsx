'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Zap, X, MessageSquare, Truck, Percent } from 'lucide-react'
import { LeadForm } from '@/components/shared/LeadForm'

const NAV_CARDS = [
  { icon: MessageSquare, label: 'Отзывы клиентов', href: '#reviews' },
  { icon: Truck, label: 'Наш автопарк', href: '/catalog' },
  { icon: Percent, label: 'Скидки при долгосрочной аренде', href: '/services' },
] as const

const HERO_IMAGE = '/hero.png'



export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <section className="relative min-h-screen overflow-hidden bg-dark -mt-20 pt-20">
      {/* ── Mobile background (< lg) ── */}
      <div className="absolute inset-0 lg:hidden">
        <Image
          src={HERO_IMAGE}
          alt="Аренда спецтехники в Санкт-Петербурге — автокраны, экскаваторы, погрузчики на объекте"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Heavy dark overlay so white text reads well */}
        <div className="absolute inset-0 bg-dark/85" />
      </div>

      {/* ── Radial glow behind heading ── */}
      <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0 hidden lg:block"></div>

      {/* ── Desktop semicircular image (≥ lg) ── */}
      <div className="absolute right-0 top-0 hidden h-full w-[55%] bg-dark lg:block [clip-path:ellipse(100%_100%_at_100%_50%)] will-change-transform [transform:translateZ(0)_scale(1.002)]">
        <Image
          src={HERO_IMAGE}
          alt="Аренда спецтехники в Санкт-Петербурге — автокраны, экскаваторы, погрузчики на объекте"
          fill
          sizes="55vw"
          className="object-cover object-center"
          priority
        />
        {/* Gradient fade into the dark left side */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-dark via-dark/60 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 container mx-auto flex h-full min-h-screen flex-col justify-center px-4 pt-24 pb-52">
        <div className="lg:w-1/2 flex flex-col justify-center">
          {/* SEO H1 Badge */}
          <h1 className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/50 text-accent text-xs sm:text-sm font-bold tracking-widest uppercase mb-6">
            <Zap size={14} className="flex-shrink-0 fill-accent" />
            Профессиональная аренда спецтехники в&nbsp;СПб
          </h1>

          {/* Emotional headline */}
          <div className="font-display font-bold text-5xl md:text-6xl lg:text-7xl uppercase leading-none text-white mb-2">
            Ваша стройка не встанет.
          </div>

          {/* Accent subheading */}
          <div className="font-display font-bold text-5xl md:text-6xl lg:text-7xl uppercase leading-none text-accent mb-6">
            Техника на объекте через 2 часа.
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 font-medium mb-10 max-w-xl leading-relaxed">
            Фиксируем цену в договоре. Собственный парк техники. Работаем с&nbsp;НДС -22% (полный пакет документов).
          </p>

          {/* CTA */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full cursor-pointer rounded-lg bg-accent px-8 py-5 font-display text-xl font-bold uppercase text-dark shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-transform hover:scale-105 md:w-max"
          >
            Подобрать технику за 5 минут
          </button>

          {/* Trust trigger */}
          <p className="text-sm text-gray-500 mt-4 font-medium tracking-wide flex items-center gap-2">
            <span>Бесплатный расчет</span>
            <span className="text-gray-600">•</span>
            <span>Работаем 24/7</span>
          </p>
        </div>
      </div>

      {/* ── Quick Navigation Cards ── */}
      <div className="absolute bottom-0 left-0 z-20 w-full pb-6 lg:bottom-10 hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-8">
            {NAV_CARDS.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 rounded-xl border border-white/5 bg-[#1A1D24] p-6 backdrop-blur-md transition-all hover:border-accent/50 hover:shadow-[0_0_15px_rgba(255,215,0,0.1)]"
              >
                <Icon className="h-10 w-10 flex-shrink-0 text-accent transition-colors group-hover:text-accent" />
                <span className="font-display text-xl font-bold uppercase tracking-wide text-white transition-colors group-hover:text-white">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: cards in flow */}
      <div className="relative z-20 -mt-10 px-4 pb-10 lg:hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-4">
            {NAV_CARDS.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 rounded-xl border border-white/5 bg-[#1A1D24] p-6 backdrop-blur-md transition-all hover:border-accent/50 hover:shadow-[0_0_15px_rgba(255,215,0,0.1)]"
              >
                <Icon className="h-10 w-10 flex-shrink-0 text-accent transition-colors group-hover:text-accent" />
                <span className="font-display text-xl font-bold uppercase tracking-wide text-white transition-colors group-hover:text-white">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lead-form modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-xl border border-white/10 bg-surface p-6 shadow-2xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-white"
            >
              <X size={24} />
            </button>
            <h3 className="font-display text-2xl font-bold mb-2">Получите расчёт</h3>
            <p className="text-text-gray mb-6">Оставьте контакт — мы перезвоним за 5 минут.</p>
            <LeadForm
              source="Hero Modal"
              buttonText="Получить расчёт"
              showMessage={false}
              onSuccess={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </section>
  )
}
