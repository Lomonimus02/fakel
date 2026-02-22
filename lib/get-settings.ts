import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { SiteSettings } from './settings-types'

// Re-export types for convenience
export type { SiteSettings } from './settings-types'
export { formatPhoneForLink } from './settings-types'

/**
 * Получает настройки сайта с кэшированием
 * Кэш действует на время рендеринга одного запроса (React cache)
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 }
  })

  // Возвращаем дефолтные значения если настройки не найдены
  if (!settings) {
    return {
      id: 1,
      phone: '+7 (812) 999-00-00',
      email: 'spb@iron-rent.ru',
      address: 'Санкт-Петербург, ул. Строителей 15, офис 204',
      workingHours: 'Круглосуточно, 24/7',
      telegramUrl: null,
      whatsappUrl: null,
      mapIframe: null,
      contractUrl: null,
    }
  }

  return settings
})
