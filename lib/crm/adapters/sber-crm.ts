import type { CrmLeadData, CrmResult } from '../types'

/**
 * Адаптер для отправки лидов в SberCRM
 * 
 * TODO: Реализовать интеграцию с SberCRM API
 * Документация: https://developers.sber.ru/docs/ru/sbercrm
 */
export async function sendToSberCrm(data: CrmLeadData): Promise<CrmResult> {
  console.log('[SberCRM] Sending lead...', {
    name: data.name,
    phone: data.phone,
    email: data.email,
    interest: data.interest,
    source: data.source,
    message: data.message,
  })

  // TODO: Здесь будет реальная интеграция с SberCRM
  // Пример структуры запроса:
  // const response = await fetch(`${SBERCRM_API_URL}/leads`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${SBERCRM_ACCESS_TOKEN}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     lead: {
  //       name: data.name,
  //       phone: data.phone,
  //       email: data.email,
  //       source: data.source,
  //     },
  //   }),
  // })

  return { success: true }
}
