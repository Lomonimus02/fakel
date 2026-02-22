'use server'

import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram'
import { sendLeadToCrm } from '@/lib/crm'

/**
 * Результат отправки заявки
 */
type SubmitLeadResult = 
  | { success: true; leadId: number }
  | { success: false; error: string }

/**
 * Данные формы заявки
 */
interface LeadFormData {
  name: string
  phone: string
  email?: string
  machine?: string
  interest?: string
  message?: string
  source?: string
  taskType?: string
  weight?: string
  height?: string
}

/**
 * Server Action для приёма заявок
 * Сохраняет заявку в БД и отправляет уведомление в Telegram
 */
export async function submitLead(formData: FormData): Promise<SubmitLeadResult> {
  try {
    // Извлекаем данные из FormData (упрощённая форма — только телефон и комментарий)
    const phone = formData.get('phone') as string
    const message = formData.get('message') as string || undefined
    const source = formData.get('source') as string || 'website'
    const machine = formData.get('machine') as string || undefined
    
    // Имя с fallback для совместимости с БД
    const name = (formData.get('name') as string)?.trim() || 'Клиент'

    // Очищаем телефон от лишних символов
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '')

    // Валидация: должно быть минимум 11 цифр (например +7XXXXXXXXXX)
    const digitsOnly = cleanPhone.replace(/\D/g, '')
    if (!digitsOnly || digitsOnly.length < 10) {
      return { success: false, error: 'Укажите корректный номер телефона' }
    }
    
    // Собираем данные в объект для дальнейшей обработки
    const data: LeadFormData = {
      name,
      phone: cleanPhone,
      message,
      source,
      machine,
    }

    // Сохраняем заявку в базу данных
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lead = await prisma.lead.create({
      data: {
        name: data.name.trim(),
        phone: cleanPhone,
        email: data.email?.trim() || null,
        machine: data.machine?.trim() || null,
        interest: data.interest?.trim() || null,
        message: data.message?.trim() || null,
        source: data.source?.trim() || 'website',
        taskType: data.taskType?.trim() || null,
        weight: data.weight?.trim() || null,
        height: data.height?.trim() || null,
      } as any,
    })

    // Формируем простое сообщение для Telegram
    const telegramMessage = `🔥 *НОВАЯ ЗАЯВКА*

📱 *Телефон:* ${lead.phone}${lead.machine ? `\n🚜 *Техника:* ${lead.machine}` : ''}\n💬 *Комментарий:* ${lead.message || 'Нет'}\n📍 *Источник:* ${lead.source || 'website'}`

    // Отправляем в Telegram (не блокируем основной процесс при ошибке)
    await sendTelegramMessage(telegramMessage)

    // Отправляем в CRM (не блокируем основной процесс при ошибке)
    // Важно: sendLeadToCrm возвращает { success, error }, а не бросает исключение
    sendLeadToCrm({
      name: lead.name,
      phone: lead.phone,
      email: lead.email ?? undefined,
      interest: lead.interest ?? undefined,
      message: lead.message ?? undefined,
      source: lead.source ?? undefined,
    }).then(async (result) => {
      // Если CRM вернула ошибку - отправляем аварийное уведомление
      if (!result.success) {
        console.error('[Lead] CRM integration error:', result.error)
        
        const alertMessage = `⚠️ АХТУНГ! ОШИБКА CRM ⚠️

Заявка от ${lead.name} (${lead.phone}) НЕ попала в Битрикс24!
Обязательно занесите её вручную.

Причина: ${result.error || 'Неизвестная ошибка'}`

        try {
          await sendTelegramMessage(alertMessage)
        } catch (telegramError) {
          console.error('[Lead] Failed to send CRM error alert to Telegram:', telegramError)
        }
      }
    }).catch(async (error) => {
      // На случай неожиданного исключения
      console.error('[Lead] CRM unexpected error:', error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      const alertMessage = `⚠️ АХТУНГ! ОШИБКА CRM ⚠️

Заявка от ${lead.name} (${lead.phone}) НЕ попала в Битрикс24!
Обязательно занесите её вручную.

Причина: ${errorMessage}`

      try {
        await sendTelegramMessage(alertMessage)
      } catch (telegramError) {
        console.error('[Lead] Failed to send CRM error alert to Telegram:', telegramError)
      }
    })

    console.log(`[Lead] Создана заявка #${lead.id} от ${lead.name}`)

    return { success: true, leadId: lead.id }

  } catch (error) {
    console.error('[Lead] Ошибка при создании заявки:', error)
    return { success: false, error: 'Произошла ошибка. Попробуйте позже или позвоните нам.' }
  }
}

/**
 * Альтернативная версия для вызова с объектом (не FormData)
 */
export async function submitLeadData(data: LeadFormData): Promise<SubmitLeadResult> {
  const formData = new FormData()
  formData.set('name', data.name)
  formData.set('phone', data.phone)
  if (data.email) formData.set('email', data.email)
  if (data.machine) formData.set('machine', data.machine)
  if (data.interest) formData.set('interest', data.interest)
  if (data.message) formData.set('message', data.message)
  if (data.source) formData.set('source', data.source)
  if (data.taskType) formData.set('taskType', data.taskType)
  if (data.weight) formData.set('weight', data.weight)
  if (data.height) formData.set('height', data.height)
  
  return submitLead(formData)
}

/**
 * Результат удаления заявки
 */
type DeleteLeadResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Server Action для удаления заявки
 */
export async function deleteLead(leadId: number): Promise<DeleteLeadResult> {
  try {
    await prisma.lead.delete({
      where: { id: leadId },
    })

    console.log(`[Lead] Удалена заявка #${leadId}`)
    return { success: true }
  } catch (error) {
    console.error('[Lead] Ошибка при удалении заявки:', error)
    return { success: false, error: 'Не удалось удалить заявку' }
  }
}

/**
 * Server Action для обновления статуса заявки
 */
export async function updateLeadStatus(
  leadId: number, 
  status: 'NEW' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    })

    console.log(`[Lead] Обновлен статус заявки #${leadId} -> ${status}`)
    return { success: true }
  } catch (error) {
    console.error('[Lead] Ошибка при обновлении статуса:', error)
    return { success: false, error: 'Не удалось обновить статус' }
  }
}
