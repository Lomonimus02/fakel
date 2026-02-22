'use server'

import { prisma } from '@/lib/prisma'

/**
 * Результат поиска техники
 */
export interface SearchResult {
  id: number
  title: string
  slug: string
  category: string
  categorySlug: string
  imageUrl: string | null
  shiftPrice: number
}

/**
 * Результат поиска категории
 */
export interface CategoryMatch {
  slug: string
  name: string
}

/**
 * Server Action для поиска категории по названию
 * Используется для умного редиректа при сабмите поиска
 * Ищет в name и description категории
 * @param query - поисковый запрос
 * @returns категория или null
 */
export async function findCategoryByName(query: string): Promise<CategoryMatch | null> {
  const trimmed = query.trim().toLowerCase()
  
  // Минимум 3 символа для поиска категории
  if (trimmed.length < 3) {
    return null
  }

  try {
    // Получаем все категории и фильтруем для более точного контроля
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        name: true,
        description: true,
      },
    })

    // Приоритет 1: название начинается с запроса ("кран" -> "краны")
    for (const category of categories) {
      const categoryNameLower = category.name.toLowerCase()
      if (categoryNameLower.startsWith(trimmed)) {
        return { slug: category.slug, name: category.name }
      }
    }
    
    // Приоритет 2: запрос составляет >= 50% длины названия
    for (const category of categories) {
      const categoryNameLower = category.name.toLowerCase()
      if (categoryNameLower.includes(trimmed) && trimmed.length >= categoryNameLower.length * 0.5) {
        return { slug: category.slug, name: category.name }
      }
    }
    
    // Приоритет 3: поиск в description (для "автокр" -> "Автокраны" в description)
    for (const category of categories) {
      if (category.description) {
        const descLower = category.description.toLowerCase()
        // Проверяем, что в description есть слово, начинающееся с запроса
        const words = descLower.split(/\s+/)
        for (const word of words) {
          if (word.startsWith(trimmed) && trimmed.length >= 4) {
            return { slug: category.slug, name: category.name }
          }
        }
      }
    }

    return null
  } catch (error) {
    console.error('Category search error:', error)
    return null
  }
}

/**
 * Server Action для live-поиска техники
 * Ищет по названию (title) с insensitive contains
 * @param query - поисковый запрос (минимум 2 символа)
 * @returns массив найденных машин (максимум 5)
 */
export async function searchProducts(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim()
  
  // Минимум 2 символа для поиска
  if (trimmed.length < 2) {
    return []
  }

  try {
    const machines = await prisma.machine.findMany({
      where: {
        title: {
          contains: trimmed,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        shiftPrice: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: 5,
      orderBy: {
        title: 'asc',
      },
    })

    return machines.map((machine) => ({
      id: machine.id,
      title: machine.title,
      slug: machine.slug,
      category: machine.category.name,
      categorySlug: machine.category.slug,
      imageUrl: machine.imageUrl,
      shiftPrice: Number(machine.shiftPrice),
    }))
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}
