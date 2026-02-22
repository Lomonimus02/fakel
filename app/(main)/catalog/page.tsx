import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Search, Truck, ArrowRight, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getMachines, getCategories, type MachineSearchParams } from '@/lib/data'
import { MachineryCard, CatalogCallToAction } from '@/components/catalog'
import { SearchBar, Breadcrumbs, type BreadcrumbItem } from '@/components/shared'
import { getSiteSettings, formatPhoneForLink } from '@/lib/get-settings'

export const dynamic = 'force-dynamic';

// Генерация метаданных с canonical URL
export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: Promise<MachineSearchParams> 
}): Promise<Metadata> {
  const params = await searchParams
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Canonical URL - /catalog (без category параметра, т.к. категории теперь в ЧПУ)
  const canonicalUrl = `${baseUrl}/catalog`
  
  // Проверяем есть ли поисковый запрос
  const hasSearch = !!params.q
  
  return {
    title: params.q 
      ? `Поиск: ${params.q} | Каталог спецтехники | Planteo — Аренда спецтехники`
      : 'Каталог спецтехники | Planteo — Аренда спецтехники',
    description: 'Каталог строительной техники в аренду: экскаваторы, автокраны, погрузчики, бульдозеры. Вся техника в собственности с регулярным ТО.',
    alternates: {
      canonical: canonicalUrl,
    },
    // Поисковые страницы - noindex
    robots: hasSearch ? {
      index: false,
      follow: true,
    } : undefined,
  }
}

// Компонент пустого состояния
function EmptyState({ phone, phoneLink }: { phone?: string; phoneLink?: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <Search size={32} className="text-text-gray" />
      </div>
      <h3 className="font-display text-2xl font-bold uppercase mb-2">
        Ничего не найдено
      </h3>
      <p className="text-text-gray max-w-md mb-6">
        По вашему запросу не найдено техники. Попробуйте изменить параметры поиска или свяжитесь с диспетчером — подберём технику под вашу задачу.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/catalog"
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
        >
          Весь каталог
        </Link>
        {phone && phoneLink && (
          <a
            href={`tel:${phoneLink}`}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-dark rounded-lg transition-colors font-bold flex items-center gap-2"
          >
            <Phone size={18} />
            {phone}
          </a>
        )}
      </div>
    </div>
  )
}

// Скелетон для загрузки
function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-surface border border-white/5 rounded-xl p-6 animate-pulse"
        >
          <div className="h-48 bg-white/5 rounded-lg mb-6"></div>
          <div className="h-4 bg-white/5 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-white/5 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-white/5 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

// Компонент выбора категории
interface CategorySelectionProps {
  categories: Awaited<ReturnType<typeof getCategories>>
  phone: string
  phoneLink: string
}

function CategorySelection({ categories, phone, phoneLink }: CategorySelectionProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Truck size={40} className="text-accent" />
            <h1 className="font-display text-4xl md:text-5xl font-bold uppercase">
              Каталог техники
            </h1>
          </div>
          <p className="text-text-gray text-lg max-w-2xl mx-auto">
            Выберите категорию техники для просмотра доступных единиц
          </p>
        </div>

        {/* Сетка категорий */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalog/${category.slug}`}
              className="group relative bg-surface border border-white/10 rounded-xl overflow-hidden hover:border-accent/50 transition-all duration-300"
            >
              {/* Изображение категории */}
              <div className="relative h-48 bg-white/5">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={`Аренда ${category.name.toLowerCase()} в Санкт-Петербурге`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Truck size={64} className="text-white/20" />
                  </div>
                )}
                {/* Оверлей при ховере */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
              </div>

              {/* Контент */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-xl font-bold uppercase text-white group-hover:text-accent transition-colors">
                    {category.name}
                  </h2>
                  <ArrowRight size={20} className="text-text-gray group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
                {category.description && (
                  <p className="text-text-gray text-sm line-clamp-2 mb-3">
                    {category.description}
                  </p>
                )}
                <div className="text-sm">
                  <span className="text-accent font-medium">{category._count.machines}</span>
                  <span className="text-text-gray ml-1">
                    {category._count.machines === 1 ? 'единица' : 
                     category._count.machines < 5 ? 'единицы' : 'единиц'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA блок "Подбор техники" */}
        <div className="max-w-5xl mx-auto">
          <CatalogCallToAction 
            phone={phone}
            phoneLink={phoneLink}
            variant="catalog"
          />
        </div>
      </div>
    </section>
  )
}

// Интерфейс для пропсов страницы
interface CatalogPageProps {
  searchParams: Promise<MachineSearchParams>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Await searchParams в Next.js 15
  const params = await searchParams
  
  // Получаем категории и настройки
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings()
  ])
  const phoneLink = formatPhoneForLink(settings.phone)

  // Поисковый запрос
  const searchQuery = params.q?.trim()

  // Редирект на ЧПУ: если есть ?category=... -> /catalog/[category]
  if (params.category) {
    const category = categories.find((c) => c.slug === params.category)
    if (category) {
      // Собираем остальные параметры (фильтры)
      const otherParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (key !== 'category' && value) {
          otherParams.set(key, value)
        }
      }
      const queryString = otherParams.toString()
      redirect(`/catalog/${category.slug}${queryString ? `?${queryString}` : ''}`)
    }
    // Если категория не найдена - показываем выбор категории
    return <CategorySelection categories={categories} phone={settings.phone} phoneLink={phoneLink} />
  }

  // Если нет поискового запроса - показываем выбор категории
  if (!searchQuery) {
    return <CategorySelection categories={categories} phone={settings.phone} phoneLink={phoneLink} />
  }
  
  // Получаем технику по глобальному поисковому запросу (без фильтра категории)
  const machines = await getMachines({ q: searchQuery })

  // Хлебные крошки для поиска
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Каталог', href: '/catalog' },
    { label: `Поиск: ${searchQuery}`, href: `/catalog?q=${encodeURIComponent(searchQuery)}` },
  ]

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Хлебные крошки */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search size={32} className="text-accent" />
            <h1 className="font-display text-4xl md:text-5xl font-bold uppercase">
              Результаты поиска
            </h1>
          </div>
          <div className="mt-2 text-sm text-text-gray">
            Найдено: <span className="text-white font-medium">{machines.length}</span> единиц техники
            <span> по запросу &laquo;<span className="text-accent">{searchQuery}</span>&raquo;</span>
          </div>
        </div>

        {/* Поиск — только для мобильных, на десктопе есть в хедере */}
        <div className="mb-6 lg:hidden">
          <Suspense fallback={<div className="h-12 bg-surface rounded-lg animate-pulse" />}>
            <SearchBar 
              className="max-w-xl" 
              placeholder="Поиск по всему каталогу..." 
            />
          </Suspense>
        </div>

        {/* Основной контент с сайдбаром категорий */}
        <div id="catalog-results" className="flex flex-col lg:flex-row gap-8 scroll-mt-24">
          {/* Сайдбар с категориями для уточнения поиска */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 p-4 bg-surface border border-white/10 rounded-xl">
              <h2 className="font-display text-lg font-bold uppercase mb-4 flex items-center gap-2">
                <Truck size={18} className="text-accent" />
                Категории
              </h2>
              <p className="text-xs text-text-gray mb-4">
                Выберите категорию для доступа к фильтрам
              </p>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/catalog/${category.slug}`}
                    className="w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between bg-white/5 text-text-gray hover:bg-white/10 hover:text-white"
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-text-gray">
                      {category._count.machines}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Сетка товаров */}
          <div className="flex-1">
            <Suspense fallback={<CatalogSkeleton />}>
              {machines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {machines.map((machine) => (
                    <MachineryCard key={machine.id} machine={machine} />
                  ))}
                </div>
              ) : (
                <EmptyState phone={settings.phone} phoneLink={phoneLink} />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
