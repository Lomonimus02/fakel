/**
 * Данные лида для отправки в CRM
 */
export interface CrmLeadData {
  /** Имя клиента */
  name: string
  /** Телефон клиента */
  phone: string
  /** Email клиента (опционально) */
  email?: string
  /** Сообщение от клиента (опционально) */
  message?: string
  /** Источник заявки (откуда пришла) */
  source?: string
  /** Интерес клиента (какая техника) */
  interest?: string
  /** Тип работ */
  taskType?: string
  /** Вес груза */
  weight?: string
  /** Высота подъема */
  height?: string
}

/**
 * Типы поддерживаемых CRM систем
 */
export type CrmType = 'amo' | 'sber' | 'bitrix' | 'none'

/**
 * Результат отправки в CRM
 */
export interface CrmResult {
  success: boolean
  error?: string
}
