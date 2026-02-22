// Types and utilities for site settings
// This file can be safely imported in client components

export interface SiteSettings {
  id: number
  phone: string
  email: string
  address: string
  workingHours: string
  telegramUrl: string | null
  whatsappUrl: string | null
  mapIframe: string | null
  contractUrl: string | null
}

/**
 * Форматирует телефон для ссылки tel:
 * +7 (812) 999-00-00 -> +78129990000
 */
export function formatPhoneForLink(phone: string): string {
  return phone.replace(/[\s\(\)\-]/g, '')
}
