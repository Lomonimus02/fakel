'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadFileToS3 } from '@/lib/s3'

export interface UpdateSettingsInput {
  phone: string
  email: string
  address: string
  workingHours: string
  telegramUrl?: string | null
  whatsappUrl?: string | null
  mapIframe?: string | null
  contractUrl?: string | null
}

/**
 * Обновляет настройки сайта
 */
export async function updateSiteSettings(data: UpdateSettingsInput) {
  try {
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        phone: data.phone,
        email: data.email,
        address: data.address,
        workingHours: data.workingHours,
        telegramUrl: data.telegramUrl || null,
        whatsappUrl: data.whatsappUrl || null,
        mapIframe: data.mapIframe || null,
        ...(data.contractUrl !== undefined && { contractUrl: data.contractUrl }),
      },
      update: {
        phone: data.phone,
        email: data.email,
        address: data.address,
        workingHours: data.workingHours,
        telegramUrl: data.telegramUrl || null,
        whatsappUrl: data.whatsappUrl || null,
        mapIframe: data.mapIframe || null,
        ...(data.contractUrl !== undefined && { contractUrl: data.contractUrl }),
      },
    })

    // Ревалидируем все страницы чтобы обновились контакты
    revalidatePath('/', 'layout')
    
    return { success: true, message: 'Настройки сохранены' }
  } catch (error) {
    console.error('Failed to update settings:', error)
    return { success: false, error: 'Не удалось сохранить настройки' }
  }
}

/**
 * Получает текущие настройки сайта
 */
export async function getSiteSettingsAction() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 }
  })

  return settings
}

/**
 * Загружает PDF-файл договора в S3 и обновляет настройки
 */
export async function uploadContractFile(formData: FormData) {
  try {
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return { success: false, error: 'Файл не выбран' }
    }

    if (file.type !== 'application/pdf') {
      return { success: false, error: 'Допускается только PDF-файл' }
    }

    // Загружаем в S3
    const url = await uploadFileToS3(file, 'contracts')

    // Обновляем настройки
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, phone: '', email: '', address: '', workingHours: '', contractUrl: url },
      update: { contractUrl: url },
    })

    revalidatePath('/', 'layout')

    return { success: true, url }
  } catch (error) {
    console.error('Failed to upload contract:', error)
    return { success: false, error: 'Не удалось загрузить файл' }
  }
}
