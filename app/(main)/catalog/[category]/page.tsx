import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Search, Truck, Phone } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { getMachines, getCategoryBySlug, getCategories, type MachineSearchParams } from '@/lib/data'
import { MachineryCard, CatalogFilters, CatalogCallToAction, CatalogCtaBlock } from '@/components/catalog'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/shared'
import { getSiteSettings, formatPhoneForLink } from '@/lib/get-settings'
import { ExpandableText } from '@/components/ui/ExpandableText'

export const dynamic = 'force-dynamic';

// Интерфейс параметров страницы
interface CategoryPageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<MachineSearchParams>
}

// Генерация метаданных с canonical URL
export async function generateMetadata({ 
  params,
  searchParams 
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const filterParams = await searchParams
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const category = await getCategoryBySlug(categorySlug)
  
  if (!category) {
    return {
      title: 'Категория не найдена | Planteo — Аренда спецтехники',
    }
  }
  
  // Canonical URL - только категория, без фильтров
  const canonicalUrl = `${baseUrl}/catalog/${categorySlug}`
  
  // Проверяем есть ли фильтры (EAV параметры)
  const hasFilters = Object.keys(filterParams).some(key => 
    key.endsWith('_min') || key.endsWith('_max') || 
    key === 'minPrice' || key === 'maxPrice' ||
    key === 'highlight'
  )
  
  return {
    title: `${category.name} в аренду | Каталог спецтехники | Planteo — Аренда спецтехники`,
    description: category.description || `Аренда ${category.name.toLowerCase()} в Санкт-Петербурге. ${category._count.machines} единиц техники в наличии. Регулярное ТО.`,
    alternates: {
      canonical: canonicalUrl,
    },
    // Если есть фильтры - noindex
    robots: hasFilters ? {
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
        По вашему запросу не найдено техники. Попробуйте изменить параметры фильтрации, сбросить фильтры или свяжитесь с диспетчером — подберём технику под вашу задачу.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="?"
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
        >
          Сбросить фильтры
        </a>
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

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: categorySlug } = await params
  const filterParams = await searchParams
  
  // Получаем категорию
  const category = await getCategoryBySlug(categorySlug)
  
  // Если категория не найдена - 404
  if (!category) {
    notFound()
  }
  
  // Получаем все категории для фильтров
  const categories = await getCategories()
  
  // Получаем технику с фильтрацией по категории
  const machines = await getMachines(filterParams, categorySlug)
  
  // Получаем настройки сайта для телефона
  const settings = await getSiteSettings()

  // Хлебные крошки
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Каталог', href: '/catalog' },
    { label: category.name, href: `/catalog/${categorySlug}` },
  ]

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Хлебные крошки */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Truck size={32} className="text-accent" />
            <h1 className="font-display text-4xl md:text-5xl font-bold uppercase">
              {category.name}
            </h1>
          </div>
          {category.description && (
            <p className="text-text-gray">
              {category.description}
            </p>
          )}
          <div className="mt-2 text-sm text-text-gray">
            Найдено: <span className="text-white font-medium">{machines.length}</span> единиц техники
          </div>
        </div>

        {/* Основной контент */}
        <div id="catalog-results" className="flex flex-col lg:flex-row gap-8 scroll-mt-24">
          {/* Сайдбар с фильтрами */}
          <Suspense fallback={<div className="w-64 h-96 bg-surface animate-pulse rounded-xl"></div>}>
            <CatalogFilters categories={categories} currentCategorySlug={categorySlug} />
          </Suspense>

          {/* Сетка товаров */}
          <div className="flex-1">
            <Suspense fallback={<CatalogSkeleton />}>
              {machines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {machines.slice(0, 6).map((machine) => (
                    <MachineryCard key={machine.id} machine={machine} />
                  ))}

                  {/* In-Feed CTA — показываем, только если товаров > 6 */}
                  {machines.length > 6 && <CatalogCtaBlock />}

                  {machines.slice(6).map((machine) => (
                    <MachineryCard key={machine.id} machine={machine} />
                  ))}
                </div>
              ) : (
                <EmptyState phone={settings.phone} phoneLink={formatPhoneForLink(settings.phone)} />
              )}
            </Suspense>
            
            {/* CTA блок "Не нашли?" */}
            <CatalogCallToAction 
              phone={settings.phone}
              phoneLink={formatPhoneForLink(settings.phone)}
            />
          </div>
        </div>

        {/* SEO-текст внизу страницы */}
        {category.seoTextBottom && (
          <div className="mt-16 p-8 bg-surface rounded-2xl border border-white/5">
            <ExpandableText maxHeight="300px">
              <div className="prose prose-invert prose-yellow max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:text-white prose-p:text-text-gray prose-li:text-text-gray prose-strong:text-white prose-a:text-accent hover:prose-a:text-accent-hover">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{category.seoTextBottom}</ReactMarkdown>
              </div>
            </ExpandableText>
          </div>
        )}
      </div>
    </section>
  )
}
