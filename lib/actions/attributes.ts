'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

/**
 * Генерация slug из названия
 */
function generateSlug(name: string): string {
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
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

// ===================
// CRUD для Attribute
// ===================

/**
 * Получить все атрибуты
 */
export async function getAllAttributes() {
  return prisma.attribute.findMany({
    include: {
      _count: {
        select: { 
          categories: true,
          values: true 
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

/**
 * Получить атрибут по ID
 */
export async function getAttributeById(id: number) {
  return prisma.attribute.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  })
}

/**
 * Создать новый атрибут
 */
export async function createAttribute(formData: FormData) {
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const unit = formData.get('unit') as string | null
  let slug = formData.get('slug') as string

  if (!name?.trim()) {
    return { error: 'Название атрибута обязательно' }
  }

  if (!type?.trim()) {
    return { error: 'Тип атрибута обязателен' }
  }

  // Автогенерация slug если пусто
  slug = slug?.trim() || generateSlug(name)

  // Проверяем уникальность slug
  const existing = await prisma.attribute.findUnique({ where: { slug } })
  if (existing) {
    return { error: 'Атрибут с таким slug уже существует' }
  }

  try {
    const attribute = await prisma.attribute.create({
      data: {
        name: name.trim(),
        slug,
        type: type.trim(),
        unit: unit?.trim() || null,
      },
    })
    
    revalidatePath('/admin/attributes')
    return { success: true, attribute }
  } catch (error) {
    console.error('Ошибка создания атрибута:', error)
    return { error: 'Ошибка при создании атрибута' }
  }
}

/**
 * Обновить атрибут
 */
export async function updateAttribute(id: number, formData: FormData) {
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const unit = formData.get('unit') as string | null

  if (!name?.trim()) {
    return { error: 'Название атрибута обязательно' }
  }

  if (!type?.trim()) {
    return { error: 'Тип атрибута обязателен' }
  }

  try {
    const attribute = await prisma.attribute.update({
      where: { id },
      data: {
        name: name.trim(),
        type: type.trim(),
        unit: unit?.trim() || null,
      },
    })
    
    revalidatePath('/admin/attributes')
    revalidatePath('/admin/categories')
    return { success: true, attribute }
  } catch (error) {
    console.error('Ошибка обновления атрибута:', error)
    return { error: 'Ошибка при обновлении атрибута' }
  }
}

/**
 * Удалить атрибут
 */
export async function deleteAttribute(id: number) {
  // Проверяем, есть ли значения у этого атрибута
  const valuesCount = await prisma.productAttributeValue.count({
    where: { attributeId: id },
  })

  if (valuesCount > 0) {
    return { error: `Невозможно удалить. Атрибут используется в ${valuesCount} товарах.` }
  }

  try {
    // Сначала удаляем все связи с категориями
    await prisma.categoryAttribute.deleteMany({
      where: { attributeId: id },
    })
    
    // Затем удаляем сам атрибут
    await prisma.attribute.delete({
      where: { id },
    })
    
    revalidatePath('/admin/attributes')
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления атрибута:', error)
    return { error: 'Ошибка при удалении атрибута' }
  }
}

// =============================
// Привязка атрибутов к категории
// =============================

/**
 * Получить атрибуты категории
 */
export async function getCategoryAttributes(categoryId: number) {
  return prisma.categoryAttribute.findMany({
    where: { categoryId },
    include: {
      attribute: true,
    },
    orderBy: { order: 'asc' },
  })
}

/**
 * Обновить привязку атрибутов к категории
 * @param categoryId - ID категории
 * @param attributes - массив { attributeId, isFilter, showInCard, order }
 */
export async function updateCategoryAttributes(
  categoryId: number,
  attributes: Array<{ attributeId: number; isFilter: boolean; showInCard: boolean; order: number }>
) {
  console.log('[updateCategoryAttributes] Called with categoryId:', categoryId)
  console.log('[updateCategoryAttributes] Attributes:', JSON.stringify(attributes, null, 2))
  
  try {
    // Удаляем все текущие привязки
    const deleteResult = await prisma.categoryAttribute.deleteMany({
      where: { categoryId },
    })
    console.log('[updateCategoryAttributes] Deleted existing:', deleteResult.count)

    // Создаём новые привязки
    if (attributes.length > 0) {
      const createData = attributes.map(attr => ({
        categoryId,
        attributeId: attr.attributeId,
        isFilter: attr.isFilter,
        showInCard: attr.showInCard,
        order: attr.order,
      }))
      console.log('[updateCategoryAttributes] Creating:', JSON.stringify(createData, null, 2))
      
      await prisma.categoryAttribute.createMany({
        data: createData,
      })
      console.log('[updateCategoryAttributes] Created successfully')
    }

    revalidatePath('/admin/categories')
    revalidatePath(`/admin/categories/${categoryId}`)
    revalidatePath('/catalog')
    console.log('[updateCategoryAttributes] Revalidated paths')
    return { success: true }
  } catch (error) {
    console.error('[updateCategoryAttributes] Error:', error)
    return { error: 'Ошибка при сохранении атрибутов' }
  }
}
