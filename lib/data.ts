import prisma from './prisma'
import { Prisma } from '@prisma/client'

// Типы для параметров поиска - расширяемый интерфейс для EAV
export interface MachineSearchParams {
  category?: string
  minPrice?: string
  maxPrice?: string
  available?: string
  q?: string          // Поисковый запрос
  highlight?: string  // Slug машины для подсветки (не влияет на фильтрацию)
  // Динамические EAV атрибуты: {slug}_min, {slug}_max, {slug}
  [key: string]: string | undefined
}

// Получить машины с фильтрацией (включая EAV атрибуты)
// categorySlug - новый параметр для ЧПУ (Clean URL), приоритетнее чем searchParams.category
export async function getMachines(searchParams: MachineSearchParams = {}, categorySlug?: string) {
  const { category, minPrice, maxPrice, available, q } = searchParams
  // categorySlug из ЧПУ имеет приоритет над query параметром
  const effectiveCategory = categorySlug || category

  // Строим условия фильтрации
  const where: Prisma.MachineWhereInput = {}

  // Поиск по тексту (название и описание)
  if (q && q.trim()) {
    const searchQuery = q.trim()
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } },
    ]
  }

  // Фильтр по категории (slug)
  if (effectiveCategory) {
    where.category = {
      slug: effectiveCategory,
    }
  }

  // Фильтр по минимальной цене
  if (minPrice) {
    const min = parseFloat(minPrice)
    if (!isNaN(min)) {
      where.shiftPrice = {
        ...((where.shiftPrice as Prisma.DecimalFilter) || {}),
        gte: min,
      }
    }
  }

  // Фильтр по максимальной цене
  if (maxPrice) {
    const max = parseFloat(maxPrice)
    if (!isNaN(max)) {
      where.shiftPrice = {
        ...((where.shiftPrice as Prisma.DecimalFilter) || {}),
        lte: max,
      }
    }
  }

  // Фильтр по доступности
  if (available === 'true') {
    where.isAvailable = true
  }

  // === EAV ФИЛЬТРАЦИЯ ===
  // Собираем условия фильтрации по EAV атрибутам
  // Для сложных EAV запросов используем raw SQL или подзапросы
  
  // Словарь для обработки минимумов и максимумов
  const rangeFilters: Record<string, { min?: number; max?: number }> = {}
  const textFilters: { slug: string; value: string }[] = []
  
  // Парсим параметры поиска для EAV
  for (const [key, value] of Object.entries(searchParams)) {
    if (!value) continue
    // Пропускаем служебные поля (включая highlight для поиска)
    if (['category', 'minPrice', 'maxPrice', 'available', 'q', 'highlight'].includes(key)) continue
    
    // Проверяем формат: {slug}_min или {slug}_max
    if (key.endsWith('_min')) {
      const slug = key.replace(/_min$/, '')
      const numValue = parseFloat(value)
      if (!isNaN(numValue)) {
        if (!rangeFilters[slug]) rangeFilters[slug] = {}
        rangeFilters[slug].min = numValue
      }
    } else if (key.endsWith('_max')) {
      const slug = key.replace(/_max$/, '')
      const numValue = parseFloat(value)
      if (!isNaN(numValue)) {
        if (!rangeFilters[slug]) rangeFilters[slug] = {}
        rangeFilters[slug].max = numValue
      }
    } else {
      // Текстовый/select атрибут
      textFilters.push({ slug: key, value })
    }
  }
  
  // Собираем EAV условия для where.AND
  const eavAndConditions: Prisma.MachineWhereInput[] = []
  
  // Добавляем условия для числовых диапазонов
  for (const [slug, range] of Object.entries(rangeFilters)) {
    const attrCondition: Prisma.ProductAttributeValueWhereInput = {
      attribute: { slug },
    }
    
    if (range.min !== undefined && range.max !== undefined) {
      attrCondition.valueNumber = {
        gte: range.min,
        lte: range.max,
      }
    } else if (range.min !== undefined) {
      attrCondition.valueNumber = { gte: range.min }
    } else if (range.max !== undefined) {
      attrCondition.valueNumber = { lte: range.max }
    }
    
    eavAndConditions.push({
      attributes: { some: attrCondition },
    })
  }
  
  // Добавляем условия для текстовых атрибутов
  for (const { slug, value } of textFilters) {
    eavAndConditions.push({
      attributes: {
        some: {
          attribute: { slug },
          valueString: { contains: value, mode: 'insensitive' },
        },
      },
    })
  }
  
  // Если есть EAV условия, добавляем их в where.AND
  if (eavAndConditions.length > 0) {
    if (where.AND && Array.isArray(where.AND)) {
      where.AND.push(...eavAndConditions)
    } else if (where.AND) {
      where.AND = [where.AND as Prisma.MachineWhereInput, ...eavAndConditions]
    } else {
      where.AND = eavAndConditions
    }
  }

  const machines = await prisma.machine.findMany({
    where,
    include: {
      category: {
        include: {
          attributes: true, // Настройки категории для showInCard
        },
      },
      attributes: {
        include: {
          attribute: true, // EAV значения машины
        },
      },
    },
    orderBy: [
      { isFeatured: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  // Convert Decimal fields to numbers for client components
  return machines.map(machine => ({
    ...machine,
    shiftPrice: Number(machine.shiftPrice),
    hourlyPrice: machine.hourlyPrice ? Number(machine.hourlyPrice) : null,
  }))
}

// Получить одну машину по slug
export async function getMachineBySlug(slug: string) {
  const machine = await prisma.machine.findUnique({
    where: { slug },
    include: {
      category: true,
      attributes: {
        include: {
          attribute: true,
        },
      },
    },
  })

  if (!machine) return null

  // Convert Decimal fields to numbers for client components
  return {
    ...machine,
    shiftPrice: Number(machine.shiftPrice),
    hourlyPrice: machine.hourlyPrice ? Number(machine.hourlyPrice) : null,
  }
}

// Получить машину по slug с проверкой категории (для ЧПУ)
export async function getMachineBySlugAndCategory(slug: string, categorySlug: string) {
  const machine = await prisma.machine.findFirst({
    where: { 
      slug,
      category: { slug: categorySlug }
    },
    include: {
      category: true,
      attributes: {
        include: {
          attribute: true,
        },
      },
    },
  })

  if (!machine) return null

  // Convert Decimal fields to numbers for client components
  return {
    ...machine,
    shiftPrice: Number(machine.shiftPrice),
    hourlyPrice: machine.hourlyPrice ? Number(machine.hourlyPrice) : null,
  }
}

// Получить все категории
export async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { machines: true },
      },
      // Для фильтров на странице каталога - атрибуты с isFilter=true
      attributes: {
        where: { isFilter: true },
        orderBy: { order: 'asc' },
        include: {
          attribute: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return categories
}

// Получить одну категорию по slug
export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug },
    include: {
      _count: {
        select: { machines: true },
      },
      attributes: {
        where: { isFilter: true },
        orderBy: { order: 'asc' },
        include: {
          attribute: true,
        },
      },
    },
  })

  return category
}

// Получить featured технику для главной
export async function getFeaturedMachines(limit = 3) {
  const machines = await prisma.machine.findMany({
    where: {
      isFeatured: true,
      isAvailable: true,
    },
    include: {
      category: true,
    },
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Convert Decimal fields to numbers for client components
  return machines.map(machine => ({
    ...machine,
    shiftPrice: Number(machine.shiftPrice),
    hourlyPrice: machine.hourlyPrice ? Number(machine.hourlyPrice) : null,
  }))
}

// Получить featured технику для главной (сериализованные данные для Client Components)
export async function getFeaturedMachinesSerialized(limit = 3) {
  const machines = await prisma.machine.findMany({
    where: {
      isFeatured: true,
      isAvailable: true,
    },
    include: {
      category: {
        include: {
          attributes: true, // Настройки категории для showInCard
        },
      },
      attributes: {
        include: {
          attribute: true, // EAV значения машины
        },
      },
    },
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Сериализуем для передачи в Client Component
  return machines.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    categoryId: m.categoryId,
    shiftPrice: Number(m.shiftPrice),
    hourlyPrice: m.hourlyPrice ? Number(m.hourlyPrice) : null,
    specs: m.specs,
    description: m.description,
    imageUrl: m.imageUrl,
    images: m.images,
    isFeatured: m.isFeatured,
    isAvailable: m.isAvailable,
    category: {
      id: m.category.id,
      name: m.category.name,
      slug: m.category.slug,
      attributes: m.category.attributes.map(ca => ({
        attributeId: ca.attributeId,
        showInCard: ca.showInCard,
      })),
    },
    attributes: m.attributes.map(a => ({
      attributeId: a.attributeId,
      valueNumber: a.valueNumber,
      valueString: a.valueString,
      attribute: {
        name: a.attribute.name,
        unit: a.attribute.unit,
      },
    })),
  }))
}

// Получить категории (сериализованные данные для Client Components)
export async function getCategoriesSerialized() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { machines: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.imageUrl,
    availableFilters: c.availableFilters as string[] || [],
    _count: c._count,
  }))
}

// Получить категории с минимальными ценами для калькулятора
export async function getCategoriesWithMinPrices() {
  const categories = await prisma.category.findMany({
    include: {
      machines: {
        where: { isAvailable: true },
        select: { shiftPrice: true },
        orderBy: { shiftPrice: 'asc' },
        take: 1,
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return categories
    .filter(c => c.machines.length > 0) // Только категории с техникой
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      minPrice: c.machines[0] ? Number(c.machines[0].shiftPrice) : 0,
    }))
}

// Получить количество техники
export async function getMachinesCount() {
  return prisma.machine.count({
    where: { isAvailable: true },
  })
}

// Получить похожую технику (из той же категории, кроме текущей)
export async function getSimilarMachines(machineId: number, categoryId: number, limit = 4) {
  // Получаем машины из той же категории, кроме текущей
  const machines = await prisma.machine.findMany({
    where: {
      categoryId: categoryId,
      id: { not: machineId },
      isAvailable: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    take: limit * 3, // Берём больше для случайного выбора
  })
  
  // Перемешиваем и берём нужное количество (Random для SEO)
  const shuffled = machines.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, limit)
  
  // Конвертируем Decimal поля
  return selected.map(m => ({
    ...m,
    shiftPrice: Number(m.shiftPrice),
    hourlyPrice: m.hourlyPrice ? Number(m.hourlyPrice) : null,
  }))
}

// Получить технику для кросс-продаж (из связанных категорий)
export async function getCrossSellMachines(categoryId: number, limit = 4) {
  // 1. Получаем связанные категории
  const relatedCategories = await prisma.relatedCategory.findMany({
    where: { sourceCategoryId: categoryId },
    select: { targetCategoryId: true },
  })
  
  if (relatedCategories.length === 0) {
    return []
  }
  
  const relatedCategoryIds = relatedCategories.map(r => r.targetCategoryId)
  
  // 2. Получаем случайные машины из связанных категорий
  // Используем более простой подход: получаем все подходящие машины и выбираем случайные
  const machines = await prisma.machine.findMany({
    where: {
      categoryId: { in: relatedCategoryIds },
      isAvailable: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    take: limit * 3, // Берём больше для случайного выбора
  })
  
  // Перемешиваем и берём нужное количество
  const shuffled = machines.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, limit)
  
  // Конвертируем Decimal поля
  return selected.map(m => ({
    ...m,
    shiftPrice: Number(m.shiftPrice),
    hourlyPrice: m.hourlyPrice ? Number(m.hourlyPrice) : null,
  }))
}

// Типы для экспорта
export type MachineWithCategory = Awaited<ReturnType<typeof getMachines>>[number]
export type CategoryWithCount = Awaited<ReturnType<typeof getCategories>>[number]
export type CrossSellMachine = Awaited<ReturnType<typeof getCrossSellMachines>>[number]
export type SimilarMachine = Awaited<ReturnType<typeof getSimilarMachines>>[number]
