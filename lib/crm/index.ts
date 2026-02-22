import type { CrmLeadData, CrmType, CrmResult } from './types'
import { sendToAmoCrm } from './adapters/amo-crm'
import { sendToSberCrm } from './adapters/sber-crm'
import { sendToBitrix } from './adapters/bitrix'

// Реэкспорт типов для удобства использования
export type { CrmLeadData, CrmType, CrmResult }

/**
 * Получает текущий тип CRM из переменных окружения
 */
function getCrmType(): CrmType {
  const crmType = process.env.CRM_TYPE?.toLowerCase()
  
  if (crmType === 'amo') return 'amo'
  if (crmType === 'sber') return 'sber'
  if (crmType === 'bitrix') return 'bitrix'
  
  return 'none'
}

/**
 * Отправляет данные лида в настроенную CRM систему
 * 
 * Использует паттерн Adapter для поддержки разных CRM.
 * Тип CRM определяется переменной окружения CRM_TYPE:
 * - 'amo' - AmoCRM
 * - 'sber' - SberCRM
 * - 'none' или не указано - CRM отключена
 * 
 * @param data - Данные лида для отправки
 * @returns Результат отправки
 */
export async function sendLeadToCrm(data: CrmLeadData): Promise<CrmResult> {
  const crmType = getCrmType()

  // CRM отключена
  if (crmType === 'none') {
    console.log('[CRM] Integration disabled (CRM_TYPE=none or not set)')
    return { success: true }
  }

  try {
    console.log(`[CRM] Sending lead to ${crmType.toUpperCase()}...`)

    let result: CrmResult

    switch (crmType) {
      case 'amo':
        result = await sendToAmoCrm(data)
        break
      case 'sber':
        result = await sendToSberCrm(data)
        break
      case 'bitrix':
        result = await sendToBitrix(data)
        break
      default:
        // TypeScript exhaustiveness check
        const _exhaustiveCheck: never = crmType
        return _exhaustiveCheck
    }

    if (result.success) {
      console.log(`[CRM] Lead successfully sent to ${crmType.toUpperCase()}`)
    } else {
      console.error(`[CRM] Failed to send lead to ${crmType.toUpperCase()}:`, result.error)
    }

    return result

  } catch (error) {
    // Логируем ошибку, но не ломаем работу сайта
    console.error('[CRM] Error sending lead:', error instanceof Error ? error.message : error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown CRM error',
    }
  }
}
