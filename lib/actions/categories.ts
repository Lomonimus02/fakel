'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

/**
 * Генерация slug из названия
 */
function generateSlug(name: string): string {
  // Транслитерация кириллицы
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  }

  return name
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Создание новой категории
 */
export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string | null
  const seoTextBottom = formData.get('seoTextBottom') as string | null
  const imageUrl = formData.get('imageUrl') as string | null
  const availableFiltersJson = formData.get('availableFilters') as string | null

  if (!name?.trim()) {
    return { error: 'Название категории обязательно' }
  }

  // Автогенерация slug если пусто
  const finalSlug = slug?.trim() || generateSlug(name)

  // Парсим availableFilters
  let availableFilters: string[] = []
  if (availableFiltersJson) {
    try {
      availableFilters = JSON.parse(availableFiltersJson)
    } catch {
      availableFilters = []
    }
  }

  // Проверяем уникальность slug
  const existing = await prisma.category.findUnique({ where: { slug: finalSlug } })
  if (existing) {
    return { error: 'Категория с таким URL уже существует' }
  }

  try {
    await prisma.category.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        seoTextBottom: seoTextBottom?.trim() || null,
        imageUrl: imageUrl || null,
        availableFilters: availableFilters,
      },
    })
  } catch (error) {
    console.error('Ошибка создания категории:', error)
    return { error: 'Ошибка при создании категории' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/catalog')
  redirect('/admin/categories')
}

/**
 * Обновление категории
 */
export async function updateCategory(id: number, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const seoTextBottom = formData.get('seoTextBottom') as string | null
  const imageUrl = formData.get('imageUrl') as string | null
  const availableFiltersJson = formData.get('availableFilters') as string | null

  if (!name?.trim()) {
    return { error: 'Название категории обязательно' }
  }

  // Получаем текущую категорию для сохранения slug
  const currentCategory = await prisma.category.findUnique({ where: { id } })
  if (!currentCategory) {
    return { error: 'Категория не найдена' }
  }

  // Используем существующий slug или генерируем новый из названия
  const slug = currentCategory.slug || generateSlug(name)

  // Парсим availableFilters
  let availableFilters: string[] = []
  if (availableFiltersJson) {
    try {
      availableFilters = JSON.parse(availableFiltersJson)
    } catch {
      availableFilters = []
    }
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        seoTextBottom: seoTextBottom?.trim() || null,
        imageUrl: imageUrl || null,
        availableFilters: availableFilters,
      },
    })
  } catch (error) {
    console.error('Ошибка обновления категории:', error)
    return { error: 'Ошибка при обновлении категории' }
  }

  revalidatePath('/admin/categories')
  revalidatePath(`/admin/categories/${id}`)
  revalidatePath('/catalog')
  revalidatePath(`/catalog/${slug}`)
  return { success: true }
}

/**
 * Удаление категории
 */
export async function deleteCategory(id: number) {
  // Проверяем есть ли связанная техника
  const machinesCount = await prisma.machine.count({
    where: { categoryId: id },
  })

  if (machinesCount > 0) {
    return { error: `Невозможно удалить категорию. Она содержит ${machinesCount} единиц техники.` }
  }

  try {
    await prisma.category.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Ошибка удаления категории:', error)
    return { error: 'Ошибка при удалении категории' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/catalog')
  redirect('/admin/categories')
}

/**
 * Получение категории по ID
 */
export async function getCategoryById(id: number) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { machines: true },
      },
    },
  })
}

/**
 * Получение всех категорий
 */
export async function getAllCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { machines: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

/**
 * Получение связанных категорий для кросс-продаж
 */
export async function getRelatedCategories(categoryId: number) {
  const relations = await prisma.relatedCategory.findMany({
    where: { sourceCategoryId: categoryId },
    include: {
      targetCategory: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  
  return relations.map(r => r.targetCategory)
}

/**
 * Обновление связанных категорий для кросс-продаж
 */
export async function updateRelatedCategories(
  sourceCategoryId: number,
  targetCategoryIds: number[]
) {
  try {
    // Удаляем все существующие связи
    await prisma.relatedCategory.deleteMany({
      where: { sourceCategoryId },
    })
    
    // Создаём новые связи (исключаем self-reference)
    const validTargetIds = targetCategoryIds.filter(id => id !== sourceCategoryId)
    
    if (validTargetIds.length > 0) {
      await prisma.relatedCategory.createMany({
        data: validTargetIds.map(targetCategoryId => ({
          sourceCategoryId,
          targetCategoryId,
        })),
      })
    }
    
    revalidatePath('/admin/categories')
    revalidatePath(`/admin/categories/${sourceCategoryId}`)
    revalidatePath('/catalog')
    
    return { success: true }
  } catch (error) {
    console.error('Ошибка обновления связанных категорий:', error)
    return { error: 'Ошибка при сохранении связанных категорий' }
  }
}
