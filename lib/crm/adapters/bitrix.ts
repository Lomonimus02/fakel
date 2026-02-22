import type { CrmLeadData, CrmResult } from '../types'

/**
 * URL вебхука Bitrix24 из переменных окружения
 */
const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL

/**
 * Интерфейс ответа Bitrix24 API
 */
interface BitrixResponse {
  result?: number
  error?: string
  error_description?: string
}

/**
 * Формирует текстовый комментарий для лида в Bitrix24
 */
function formatBitrixComment(data: CrmLeadData): string {
  const lines: string[] = []

  // Добавляем информацию о технике и параметрах
  if (data.interest) {
    lines.push(`Интерес: ${data.interest}`)
  }
  if (data.taskType) {
    lines.push(`Тип работ: ${data.taskType}`)
  }
  if (data.weight) {
    lines.push(`Вес груза: ${data.weight} т`)
  }
  if (data.height) {
    lines.push(`Высота/Вылет: ${data.height} м`)
  }

  // Источник всегда добавляем
  lines.push(`Источник: ${data.source || 'Не указан'}`)

  // Разделитель и сообщение клиента
  lines.push('---')
  lines.push(`Сообщение: ${data.message || 'Не указано'}`)

  return lines.join('\n')
}

/**
 * Адаптер для отправки лидов в Битрикс24 через входящий вебхук
 * 
 * Документация: https://dev.1c-bitrix.ru/rest_help/crm/leads/crm_lead_add.php
 */
export async function sendToBitrix(data: CrmLeadData): Promise<CrmResult> {
  // Проверяем наличие URL вебхука
  if (!BITRIX_WEBHOOK_URL) {
    console.warn('[Bitrix24] BITRIX_WEBHOOK_URL not configured, skipping...')
    return { success: true }
  }

  console.log('[Bitrix24] Sending lead...', {
    name: data.name,
    phone: data.phone,
    interest: data.interest,
    taskType: data.taskType,
    weight: data.weight,
    height: data.height,
    source: data.source,
    message: data.message,
  })

  try {
    // Формируем заголовок лида
    const leadTitle = `Заявка с сайта: ${data.interest || 'Общая консультация'}`

    // Формируем комментарий с данными лида
    const commentText = formatBitrixComment(data)
    console.log('[Bitrix24] Comment:', commentText)

    // Формируем тело запроса для Bitrix24 REST API
    const requestBody = {
      fields: {
        TITLE: leadTitle,
        NAME: data.name,
        PHONE: [
          {
            VALUE: data.phone,
            VALUE_TYPE: 'WORK',
          },
        ],
        SOURCE_ID: 'WEB',
        SOURCE_DESCRIPTION: data.source || 'Сайт',
        COMMENTS: commentText,
      },
    }

    console.log('[Bitrix24] Request body:', JSON.stringify(requestBody, null, 2))

    // Добавляем email если есть
    if (data.email) {
      Object.assign(requestBody.fields, {
        EMAIL: [
          {
            VALUE: data.email,
            VALUE_TYPE: 'WORK',
          },
        ],
      })
    }

    // Отправляем запрос к Bitrix24
    // Если URL уже содержит метод API - используем как есть
    // Иначе добавляем метод crm.lead.add.json
    let webhookUrl: string
    if (BITRIX_WEBHOOK_URL.includes('crm.lead.add')) {
      webhookUrl = BITRIX_WEBHOOK_URL
    } else {
      webhookUrl = BITRIX_WEBHOOK_URL.endsWith('/')
        ? `${BITRIX_WEBHOOK_URL}crm.lead.add.json`
        : `${BITRIX_WEBHOOK_URL}/crm.lead.add.json`
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`)
    }

    const result: BitrixResponse = await response.json()

    // Проверяем на ошибки в ответе Bitrix
    if (result.error) {
      throw new Error(`Bitrix error: ${result.error} - ${result.error_description || 'No description'}`)
    }

    console.log(`[Bitrix24] Lead created successfully, ID: ${result.result}`)

    return { success: true }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Bitrix24] Failed to send lead:', errorMessage)
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}
