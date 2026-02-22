'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

/**
 * Получение всех отзывов (для админки)
 */
export async function getAllReviews() {
  return prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Получение видимых отзывов (для сайта)
 */
export async function getVisibleReviews() {
  return prisma.review.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Получение отзыва по ID
 */
export async function getReviewById(id: number) {
  return prisma.review.findUnique({
    where: { id },
  })
}

/**
 * Создание нового отзыва
 */
export async function createReview(formData: FormData) {
  const author = formData.get('author') as string
  const role = formData.get('role') as string | null
  const text = formData.get('text') as string
  const ratingStr = formData.get('rating') as string
  const isVisibleStr = formData.get('isVisible') as string
  const scanUrl = formData.get('scanUrl') as string | null

  if (!author?.trim()) {
    return { error: 'Имя автора обязательно' }
  }

  if (!text?.trim()) {
    return { error: 'Текст отзыва обязателен' }
  }

  const rating = parseInt(ratingStr, 10) || 5
  const isVisible = isVisibleStr === 'true'

  try {
    await prisma.review.create({
      data: {
        author: author.trim(),
        role: role?.trim() || null,
        text: text.trim(),
        rating: Math.min(5, Math.max(1, rating)),
        isVisible,
        scanUrl: scanUrl?.trim() || null,
      },
    })
  } catch (error) {
    console.error('Ошибка создания отзыва:', error)
    return { error: 'Ошибка при создании отзыва' }
  }

  revalidatePath('/admin/reviews')
  redirect('/admin/reviews')
}

/**
 * Обновление отзыва
 */
export async function updateReview(id: number, formData: FormData) {
  const author = formData.get('author') as string
  const role = formData.get('role') as string | null
  const text = formData.get('text') as string
  const ratingStr = formData.get('rating') as string
  const isVisibleStr = formData.get('isVisible') as string
  const scanUrl = formData.get('scanUrl') as string | null

  if (!author?.trim()) {
    return { error: 'Имя автора обязательно' }
  }

  if (!text?.trim()) {
    return { error: 'Текст отзыва обязателен' }
  }

  const rating = parseInt(ratingStr, 10) || 5
  const isVisible = isVisibleStr === 'true'

  try {
    await prisma.review.update({
      where: { id },
      data: {
        author: author.trim(),
        role: role?.trim() || null,
        text: text.trim(),
        rating: Math.min(5, Math.max(1, rating)),
        isVisible,
        scanUrl: scanUrl?.trim() || null,
      },
    })
  } catch (error) {
    console.error('Ошибка обновления отзыва:', error)
    return { error: 'Ошибка при обновлении отзыва' }
  }

  revalidatePath('/admin/reviews')
  revalidatePath(`/admin/reviews/${id}`)
  redirect('/admin/reviews')
}

/**
 * Удаление отзыва
 */
export async function deleteReview(id: number) {
  try {
    await prisma.review.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Ошибка удаления отзыва:', error)
    return { error: 'Ошибка при удалении отзыва' }
  }

  revalidatePath('/admin/reviews')
  redirect('/admin/reviews')
}

/**
 * Переключение видимости отзыва
 */
export async function toggleReviewVisibility(id: number) {
  const review = await prisma.review.findUnique({ where: { id } })
  
  if (!review) {
    return { error: 'Отзыв не найден' }
  }

  try {
    await prisma.review.update({
      where: { id },
      data: { isVisible: !review.isVisible },
    })
  } catch (error) {
    console.error('Ошибка переключения видимости:', error)
    return { error: 'Ошибка при обновлении отзыва' }
  }

  revalidatePath('/admin/reviews')
}
