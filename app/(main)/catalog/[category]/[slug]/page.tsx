import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, MapPin, Clock, Shield, FileDown } from 'lucide-react'
import { getMachineBySlugAndCategory, getCrossSellMachines, getSimilarMachines } from '@/lib/data'
import { RentalCalculator, OrderButton } from '@/components/product'
import { OptimizedImage, Breadcrumbs, type BreadcrumbItem } from '@/components/shared'
import { MachineryCard, CatalogCallToAction } from '@/components/catalog'
import { MobileSwiper } from '@/components/shared'
import { getSiteSettings, formatPhoneForLink } from '@/lib/get-settings'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

export const dynamic = 'force-dynamic';

// Интерфейс параметров
interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug, slug } = await params
  const machine = await getMachineBySlugAndCategory(slug, categorySlug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!machine) {
    return {
      title: 'Техника не найдена | Planteo — Аренда спецтехники',
    }
  }

  const price = Number(machine.shiftPrice).toLocaleString('ru-RU')

  return {
    title: `Аренда ${machine.title} в Санкт-Петербурге — цена ${price} ₽/смена | Planteo — Аренда спецтехники`,
    description: machine.description
      ? machine.description.slice(0, 160)
      : `Аренда ${machine.title} в СПб. Цена от ${price} ₽ за смену. Доставка по городу и области. Опытные машинисты.`,
    alternates: {
      canonical: `${baseUrl}/catalog/${categorySlug}/${machine.slug}`,
    },
    openGraph: {
      type: 'article',
      url: `${baseUrl}/catalog/${categorySlug}/${machine.slug}`,
      title: `Аренда ${machine.title} — ${price} ₽/смена`,
      description: machine.description || `Аренда ${machine.title} в Санкт-Петербурге`,
      images: machine.imageUrl
        ? [{ url: machine.imageUrl, width: 1200, height: 630, alt: machine.title }]
        : [],
    },
  }
}

// Парсинг specs из JSON
function parseSpecs(specs: unknown): Record<string, string> {
  if (typeof specs === 'string') {
    try {
      return JSON.parse(specs)
    } catch {
      return {}
    }
  }
  if (typeof specs === 'object' && specs !== null) {
    return specs as Record<string, string>
  }
  return {}
}

// Типы для EAV атрибутов (соответствуют Prisma схеме)
interface MachineAttribute {
  id: string
  attributeId: number
  machineId: number
  valueNumber: number | null
  valueString: string | null
  attribute: {
    id: number
    name: string
    slug: string
    type: string
    unit: string | null
  }
}

// Форматирование значения EAV атрибута
function formatAttributeValue(attr: MachineAttribute): string {
  const { attribute, valueString, valueNumber } = attr
  
  // Для числовых значений используем valueNumber
  if (attribute.type === 'number' && valueNumber !== null) {
    const formattedNum = Number.isInteger(valueNumber) 
      ? valueNumber.toString() 
      : valueNumber.toLocaleString('ru-RU')
    return attribute.unit ? `${formattedNum} ${attribute.unit}` : formattedNum
  }
  
  // Для boolean
  if (attribute.type === 'boolean') {
    return valueString === 'true' ? 'Да' : 'Нет'
  }
  
  // Для текста и select
  const value = valueString || ''
  return attribute.unit ? `${value} ${attribute.unit}` : value
}

// Метки для характеристик
const specLabels: Record<string, string> = {
  weight: 'Масса',
  bucketVolume: 'Объём ковша',
  maxDepth: 'Макс. глубина копания',
  maxReach: 'Макс. вылет',
  engine: 'Двигатель',
  year: 'Год выпуска',
  liftingCapacity: 'Грузоподъёмность',
  boomLength: 'Длина стрелы',
  maxHeight: 'Макс. высота подъёма',
  axles: 'Количество осей',
  bucketCapacity: 'Объём ковша',
  operatingWeight: 'Эксплуатационная масса',
  maxLiftHeight: 'Макс. высота подъёма',
  maxLoadCapacity: 'Макс. грузоподъёмность',
  bladeCapacity: 'Объём отвала',
  bladeWidth: 'Ширина отвала',
  chassis: 'Шасси',
  maxSpeed: 'Макс. скорость',
}

// Парсинг badges
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
const badgeConfig: Record<string, { label: string; bgColor: string }> = {
  owner: { label: 'СОБСТВЕННИК', bgColor: 'bg-green-500' },
  hit: { label: 'ХИТ', bgColor: 'bg-orange-500' },
  new: { label: 'НОВИНКА', bgColor: 'bg-blue-500' },
  sale: { label: 'СКИДКА', bgColor: 'bg-red-500' },
}

export default async function MachinePage({ params }: PageProps) {
  const { category: categorySlug, slug } = await params
  
  // Получаем машину с проверкой категории (защита от дублей URL)
  const machine = await getMachineBySlugAndCategory(slug, categorySlug)

  if (!machine) {
    notFound()
  }

  // Получаем рекомендации, похожую технику и настройки сайта
  const [crossSellMachines, similarMachines, settings] = await Promise.all([
    getCrossSellMachines(machine.category.id, 4),
    getSimilarMachines(machine.id, machine.category.id, 4),
    getSiteSettings()
  ])

  const specs = parseSpecs(machine.specs)
  const specEntries = Object.entries(specs)
  const badges = parseBadges(machine.badges)
  const shiftPrice = Number(machine.shiftPrice)
  const hourlyPrice = machine.hourlyPrice ? Number(machine.hourlyPrice) : null
  
  // EAV атрибуты (динамические характеристики)
  const eavAttributes = (machine.attributes || []) as MachineAttribute[]

  // Хлебные крошки с ЧПУ
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Каталог', href: '/catalog' },
    { label: machine.category.name, href: `/catalog/${machine.category.slug}` },
    { label: machine.title, href: `/catalog/${machine.category.slug}/${machine.slug}` },
  ]
  
  // Базовый URL для Schema.org
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Schema.org Product JSON-LD
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: machine.title,
    description: machine.description || `Аренда ${machine.title} в Санкт-Петербурге`,
    image: machine.imageUrl ? `${baseUrl}${machine.imageUrl}` : undefined,
    url: `${baseUrl}/catalog/${machine.category.slug}/${machine.slug}`,
    category: machine.category.name,
    brand: {
      '@type': 'Brand',
      name: 'Planteo',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: shiftPrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: machine.isAvailable 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Planteo',
      },
    },
    // Дополнительные свойства из EAV
    additionalProperty: eavAttributes.map(attr => ({
      '@type': 'PropertyValue',
      name: attr.attribute.name,
      value: attr.valueNumber !== null 
        ? `${attr.valueNumber}${attr.attribute.unit ? ` ${attr.attribute.unit}` : ''}`
        : attr.valueString || '',
      unitText: attr.attribute.unit || undefined,
    })),
  }
  
  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  }

  return (
    <>
      {/* JSON-LD Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Плавающая кнопка "Назад в каталог" */}
      <div className="sticky top-24 z-40 pointer-events-none">
        <div className="container mx-auto px-4">
          <Link
            href={`/catalog/${machine.category.slug}#${machine.slug}`}
            className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 bg-dark/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg hover:bg-dark hover:text-accent hover:border-accent/30 transition-all"
          >
            <ArrowLeft size={16} />
            <span>Вернуться в каталог</span>
          </Link>
        </div>
      </div>
      
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Хлебные крошки */}
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Левая колонка - Фото */}
          <div className="-mx-4 md:mx-0">
            <div className="bg-white/[0.02] md:bg-surface md:border md:border-white/10 md:rounded-xl sticky top-24">
              {machine.imageUrl ? (
                <div className="relative w-full aspect-[4/3] md:aspect-[4/3] lg:aspect-[4/3]">
                  <OptimizedImage
                    src={machine.imageUrl}
                    alt={`Аренда ${machine.category.name} ${machine.title} в Санкт-Петербурге`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-2 md:p-4"
                    priority
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] flex items-center justify-center bg-white/5">
                  <span className="text-text-gray">Фото отсутствует</span>
                </div>
              )}
              
              {/* Галерея миниатюр */}
              {machine.images && machine.images.length > 1 && (
                <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
                  {machine.images.map((img, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden border-2 border-transparent hover:border-accent transition cursor-pointer relative"
                    >
                      <OptimizedImage
                        src={img}
                        alt={`Аренда ${machine.category.name} ${machine.title} — фото ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка - Информация */}
          <div className="space-y-6">
            {/* Бейджи — крупные, яркие */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-2">
                {badges.map((badge) => {
                  const config = badgeConfig[badge]
                  if (!config) return null
                  return (
                    <span
                      key={badge}
                      className={`px-4 py-2 text-base font-bold uppercase rounded-lg shadow-lg ${config.bgColor} text-white`}
                    >
                      {config.label}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Категория */}
            <Link
              href={`/catalog/${machine.category.slug}`}
              className="inline-block text-sm text-accent uppercase tracking-wider hover:underline"
            >
              {machine.category.name}
            </Link>

            {/* Заголовок */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase leading-tight">
              {machine.title}
            </h1>

            {/* Ключевые характеристики — компактно в одну строку (EAV + legacy specs) */}
            {(eavAttributes.length > 0 || specEntries.length > 0) && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-text-gray">
                {/* EAV атрибуты (показываем первые 4) */}
                {eavAttributes.slice(0, 4).map((attr, index) => (
                  <span key={attr.id} className="flex items-center gap-2">
                    <span className="text-accent font-semibold">{formatAttributeValue(attr)}</span>
                    <span>{attr.attribute.name}</span>
                    {index < Math.min(eavAttributes.length, 4) - 1 && <span className="text-white/20">•</span>}
                  </span>
                ))}
                {/* Legacy specs если EAV недостаточно */}
                {eavAttributes.length < 4 && specEntries.slice(0, 4 - eavAttributes.length).map(([key, value], index) => (
                  <span key={key} className="flex items-center gap-2">
                    {eavAttributes.length > 0 && index === 0 && <span className="text-white/20">•</span>}
                    <span className="text-accent font-semibold">{value}</span>
                    <span>{specLabels[key] || key}</span>
                    {index < Math.min(specEntries.length, 4 - eavAttributes.length) - 1 && <span className="text-white/20">•</span>}
                  </span>
                ))}
              </div>
            )}

            {/* Статус доступности */}
            <div className="flex items-center gap-2">
              {machine.isAvailable ? (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-green-400 font-medium">Свободен</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-orange-400 font-medium">Занят</span>
                </>
              )}
            </div>

            {/* Блок цены — КРУПНЫЙ, заметный */}
            <div className="bg-gradient-to-br from-surface to-dark border-2 border-accent/30 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-text-gray uppercase block mb-2">
                    Смена (7+1 час)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-text-gray">от</span>
                    <span className="text-4xl md:text-5xl font-display font-bold text-accent">
                      {shiftPrice.toLocaleString('ru-RU')}
                    </span>
                    <span className="text-xl text-accent">₽</span>
                  </div>
                </div>
                {hourlyPrice && (
                  <div>
                    <span className="text-sm text-text-gray uppercase block mb-2">
                      Час
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-text-gray">от</span>
                      <span className="text-4xl md:text-5xl font-display font-bold text-white">
                        {hourlyPrice.toLocaleString('ru-RU')}
                      </span>
                      <span className="text-xl text-white/70">₽</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA кнопки внутри блока цены */}
              <div className="mt-6 space-y-3">
                {/* Главная кнопка — ОГРОМНАЯ */}
                <OrderButton machineTitle={machine.title} className="w-full py-5 text-lg" />
                
                {/* Кнопка скачивания схемы */}
                {machine.loadChartUrl && (
                  <a
                    href={machine.loadChartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-white/30 text-white hover:bg-white/10 font-bold uppercase rounded-lg transition-all"
                  >
                    <FileDown size={20} />
                    Скачать грузовысотную схему
                  </a>
                )}
              </div>
            </div>

            {/* Калькулятор */}
            <RentalCalculator
              shiftPrice={shiftPrice}
              hourlyPrice={hourlyPrice}
            />

            {/* Преимущества */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-text-gray">
                <CheckCircle size={18} className="text-green-400" />
                <span>Своя техника</span>
              </div>
              <div className="flex items-center gap-2 text-text-gray">
                <Clock size={18} className="text-accent" />
                <span>Подача за 2 часа</span>
              </div>
              <div className="flex items-center gap-2 text-text-gray">
                <MapPin size={18} className="text-accent" />
                <span>СПб и ЛО</span>
              </div>
              <div className="flex items-center gap-2 text-text-gray">
                <Shield size={18} className="text-green-400" />
                <span>Гарантия качества</span>
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя секция - Характеристики и описание */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Характеристики - EAV атрибуты + старые specs */}
          {(eavAttributes.length > 0 || specEntries.length > 0) && (
            <div className="bg-surface border border-white/10 rounded-xl p-6">
              <h2 className="font-display text-xl font-bold uppercase mb-6">
                Технические характеристики
              </h2>
              <div className="space-y-3">
                {/* EAV динамические атрибуты */}
                {eavAttributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-text-gray">
                      {attr.attribute.name}
                    </span>
                    <span className="text-white font-medium">
                      {formatAttributeValue(attr)}
                    </span>
                  </div>
                ))}
                {/* Старые specs (JSON) - для обратной совместимости */}
                {specEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-text-gray">
                      {specLabels[key] || key}
                    </span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Описание */}
          {machine.description && (
            <div className="bg-surface border border-white/10 rounded-xl p-6">
              <h2 className="font-display text-xl font-bold uppercase mb-6">
                Описание
              </h2>
              <div className="prose prose-invert prose-yellow max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:text-white prose-p:text-text-gray prose-li:text-text-gray prose-strong:text-white prose-a:text-accent hover:prose-a:text-accent-hover">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{machine.description}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Похожая техника (из той же категории) */}
        {similarMachines.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold uppercase mb-6 text-center">
              Смотрите также
            </h2>
            <p className="text-text-gray text-center mb-8 max-w-2xl mx-auto">
              Другая техника в категории &laquo;{machine.category.name}&raquo;
            </p>
            <MobileSwiper desktopCols={4} desktopGap={6}>
              {similarMachines.map((m) => (
                <MachineryCard key={m.id} machine={m as import('@/lib/data').MachineWithCategory} />
              ))}
            </MobileSwiper>
          </div>
        )}

        {/* Кросс-продажи: Вам может понадобиться */}
        {crossSellMachines.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold uppercase mb-6 text-center">
              Вам может понадобиться
            </h2>
            <p className="text-text-gray text-center mb-8 max-w-2xl mx-auto">
              Эта техника часто используется вместе с {machine.title.toLowerCase()}
            </p>
            <MobileSwiper desktopCols={4} desktopGap={6}>
              {crossSellMachines.map((m) => (
                <MachineryCard key={m.id} machine={m as import('@/lib/data').MachineWithCategory} />
              ))}
            </MobileSwiper>
          </div>
        )}

        {/* CTA блок "Подбор техники" */}
        <CatalogCallToAction 
          phone={settings.phone}
          phoneLink={formatPhoneForLink(settings.phone)}
          variant="catalog"
        />
      </div>
    </section>
    </>
  )
}
