'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { uploadFile } from './upload'

// Функция транслитерации для генерации slug
function generateSlug(title: string): string {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }

  return title
    .toLowerCase()
    .split('')
    .map(char => map[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function saveMachine(formData: FormData) {
  // Получаем ID (если редактирование) или null (если создание)
  const idString = formData.get('id') as string | null
  const id = idString ? parseInt(idString, 10) : null

  // Базовые поля
  const title = formData.get('title') as string
  let slug = (formData.get('slug') as string || '').trim()
  
  // Если slug не указан — генерируем автоматически
  if (!slug) {
    slug = generateSlug(title)
    // Проверяем уникальность и добавляем суффикс если нужно
    const existing = await prisma.machine.findUnique({ where: { slug } })
    if (existing && existing.id !== id) {
      slug = `${slug}-${Date.now()}`
    }
  }

  const categoryId = parseInt(formData.get('categoryId') as string, 10)
  const shiftPrice = parseFloat(formData.get('shiftPrice') as string)
  const hourlyPriceStr = formData.get('hourlyPrice') as string
  const hourlyPrice = hourlyPriceStr ? parseFloat(hourlyPriceStr) : null
  const description = formData.get('description') as string || null
  const isFeatured = formData.get('isFeatured') === 'on'
  const isAvailable = formData.get('isAvailable') === 'on'

  // Характеристики (JSON строка)
  const specsJson = formData.get('specs') as string
  let specs = {}
  try {
    specs = specsJson ? JSON.parse(specsJson) : {}
  } catch {
    specs = {}
  }

  // Бейджи (JSON массив строк)
  const badgesJson = formData.get('badges') as string
  let badges: string[] = []
  try {
    badges = badgesJson ? JSON.parse(badgesJson) : []
  } catch {
    badges = []
  }

  // Грузовысотная схема
  const loadChartUrlValue = formData.get('loadChartUrl') as string
  const loadChartUrl = loadChartUrlValue || null

  // Параметры для фильтрации
  const liftingCapacityStr = formData.get('liftingCapacity') as string
  const liftingCapacity = liftingCapacityStr ? parseFloat(liftingCapacityStr) : null
  
  const boomLengthStr = formData.get('boomLength') as string
  const boomLength = boomLengthStr ? parseFloat(boomLengthStr) : null
  
  const bucketVolumeStr = formData.get('bucketVolume') as string
  const bucketVolume = bucketVolumeStr ? parseFloat(bucketVolumeStr) : null
  
  const diggingDepthStr = formData.get('diggingDepth') as string
  const diggingDepth = diggingDepthStr ? parseFloat(diggingDepthStr) : null
  
  const operatingWeightStr = formData.get('operatingWeight') as string
  const operatingWeight = operatingWeightStr ? parseFloat(operatingWeightStr) : null
  
  const isAllTerrain = formData.get('isAllTerrain') === 'on'

  // Загрузка главного фото
  const imageFile = formData.get('image') as File | null
  const currentImageUrl = formData.get('currentImageUrl') as string | null
  
  console.log('[saveMachine] Image file received:', imageFile ? { name: imageFile.name, size: imageFile.size, type: imageFile.type } : 'no file')
  console.log('[saveMachine] Current image URL:', currentImageUrl)

  // Определяем итоговый URL изображения
  let imageUrl: string | null | undefined = undefined // undefined = не менять поле в Prisma

  // Проверяем, был ли загружен новый файл
  if (imageFile && imageFile.size > 0 && imageFile.name && imageFile.name !== 'undefined') {
    console.log('[saveMachine] Uploading new image...')
    const imageFormData = new FormData()
    imageFormData.append('file', imageFile)
    const uploadedUrl = await uploadFile(imageFormData)
    if (uploadedUrl) {
      imageUrl = uploadedUrl
      console.log('[saveMachine] New image uploaded:', uploadedUrl)
    }
  } else if (currentImageUrl) {
    // Файл не загружали, сохраняем текущий URL
    imageUrl = currentImageUrl
    console.log('[saveMachine] Keeping current image:', currentImageUrl)
  } else {
    // Нет ни нового файла, ни текущего URL - устанавливаем null
    imageUrl = null
    console.log('[saveMachine] No image')
  }

  // Загрузка галереи
  const galleryFiles = formData.getAll('gallery') as File[]
  const existingImagesJson = formData.get('existingImages') as string
  let images: string[] = []
  
  try {
    images = existingImagesJson ? JSON.parse(existingImagesJson) : []
  } catch {
    images = []
  }

  for (const file of galleryFiles) {
    if (file && file.size > 0) {
      const galleryFormData = new FormData()
      galleryFormData.append('file', file)
      const uploadedUrl = await uploadFile(galleryFormData)
      if (uploadedUrl) {
        images.push(uploadedUrl)
      }
    }
  }

  // Данные для сохранения
  const machineData = {
    title,
    slug,
    category: { connect: { id: categoryId } },
    shiftPrice,
    hourlyPrice,
    description,
    specs,
    badges,
    loadChartUrl,
    imageUrl,
    images,
    isFeatured,
    isAvailable,
    // Параметры для фильтрации
    liftingCapacity,
    boomLength,
    bucketVolume,
    diggingDepth,
    operatingWeight,
    isAllTerrain,
  }

  if (id) {
    // Обновление существующей записи
    await prisma.machine.update({
      where: { id },
      data: machineData,
    })
    
    // Сохраняем EAV атрибуты
    await saveProductAttributes(id, formData)
  } else {
    // Создание новой записи
    const newMachine = await prisma.machine.create({
      data: machineData,
    })
    
    // Сохраняем EAV атрибуты для новой записи
    await saveProductAttributes(newMachine.id, formData)
  }

  revalidatePath('/admin/machinery')
  revalidatePath('/catalog', 'layout')
  revalidatePath('/', 'page')
  redirect('/admin/machinery')
}

/**
 * Сохранение EAV-атрибутов для машины
 */
async function saveProductAttributes(machineId: number, formData: FormData) {
  // Получаем JSON с атрибутами из формы
  const attributesJson = formData.get('productAttributes') as string
  if (!attributesJson) return
  
  let attributes: Array<{ attributeId: number; valueNumber: number | null; valueString: string | null }>
  try {
    attributes = JSON.parse(attributesJson)
  } catch {
    return
  }
  
  // Удаляем старые значения
  await prisma.productAttributeValue.deleteMany({
    where: { machineId },
  })
  
  // Создаём новые значения (только если есть хоть какое-то значение)
  const validAttributes = attributes.filter(
    attr => attr.valueNumber !== null || (attr.valueString && attr.valueString.trim())
  )
  
  if (validAttributes.length > 0) {
    await prisma.productAttributeValue.createMany({
      data: validAttributes.map(attr => ({
        machineId,
        attributeId: attr.attributeId,
        valueNumber: attr.valueNumber,
        valueString: attr.valueString?.trim() || null,
      })),
    })
  }
}

/**
 * Получение машины с атрибутами для редактирования
 */
export async function getMachineWithAttributes(machineId: number) {
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    include: {
      attributes: {
        include: {
          attribute: true,
        },
      },
    },
  })
  
  return machine
}

/**
 * Получение атрибутов категории для формы
 */
export async function getCategoryAttributesForForm(categoryId: number) {
  return prisma.categoryAttribute.findMany({
    where: { categoryId },
    include: {
      attribute: true,
    },
    orderBy: { order: 'asc' },
  })
}

export async function deleteMachine(id: number) {
  await prisma.machine.delete({
    where: { id },
  })

  revalidatePath('/admin/machinery')
  revalidatePath('/catalog', 'layout')
  revalidatePath('/', 'page')
  redirect('/admin/machinery')
}
