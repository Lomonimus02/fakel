import type { CrmLeadData, CrmResult } from '../types'

/**
 * Адаптер для отправки лидов в AmoCRM
 * 
 * TODO: Реализовать интеграцию с AmoCRM API
 * Документация: https://www.amocrm.ru/developers/content/crm_platform/leads-api
 */
export async function sendToAmoCrm(data: CrmLeadData): Promise<CrmResult> {
  console.log('[AmoCRM] Sending lead...', {
    name: data.name,
    phone: data.phone,
    email: data.email,
    interest: data.interest,
    source: data.source,
    message: data.message,
  })

  // TODO: Здесь будет реальная интеграция с AmoCRM
  // Пример структуры запроса:
  // const response = await fetch(`${AMOCRM_DOMAIN}/api/v4/leads`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${AMOCRM_ACCESS_TOKEN}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     name: `Заявка от ${data.name}`,
  //     custom_fields_values: [
  //       { field_id: PHONE_FIELD_ID, values: [{ value: data.phone }] },
  //       { field_id: EMAIL_FIELD_ID, values: [{ value: data.email }] },
  //     ],
  //   }),
  // })

  return { success: true }
}
