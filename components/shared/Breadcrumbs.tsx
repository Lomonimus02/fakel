import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Добавляем главную страницу в начало
  const allItems: BreadcrumbItem[] = [
    { label: 'Главная', href: '/' },
    ...items,
  ]

  // Schema.org JSON-LD для BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://iron-rent.ru'}${item.href}`,
    })),
  }

  return (
    <>
      {/* JSON-LD микроразметка */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Визуальные хлебные крошки */}
      <nav 
        aria-label="Хлебные крошки" 
        className={`flex items-center flex-wrap gap-1 text-sm ${className}`}
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const isFirst = index === 0

          return (
            <div key={item.href} className="flex items-center gap-1">
              {/* Разделитель (для всех кроме первого) */}
              {index > 0 && (
                <ChevronRight size={14} className="text-text-gray flex-shrink-0" />
              )}

              {isLast ? (
                // Последний элемент - текущая страница (неактивный)
                <span 
                  className="text-text-gray truncate max-w-[200px] md:max-w-[300px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                // Активная ссылка
                <Link
                  href={item.href}
                  className="text-white hover:text-accent transition-colors flex items-center gap-1"
                >
                  {isFirst && <Home size={14} className="flex-shrink-0" />}
                  <span className="truncate max-w-[150px] md:max-w-[200px]">
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          )
        })}
      </nav>
    </>
  )
}
