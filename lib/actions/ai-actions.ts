'use server'

import { generateMachineDescription, generateCategorySeoText, MachineData, CategoryContextData } from '@/lib/ai'
import prisma from '@/lib/prisma'

export interface GenerateTextResult {
  success: boolean
  text?: string
  error?: string
}

/**
 * Server Action для генерации описания техники через AI
 */
export async function generateTextAction(
  machineData: MachineData
): Promise<GenerateTextResult> {
  try {
    // Валидация входных данных
    if (!machineData.title && !machineData.category) {
      return {
        success: false,
        error: 'Укажите хотя бы название или категорию техники',
      }
    }

    const text = await generateMachineDescription(machineData)

    return {
      success: true,
      text,
    }
  } catch (error) {
    console.error('AI generation error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Неизвестная ошибка при генерации текста'

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Server Action для генерации SEO-текста категории через AI
 * Собирает реальные данные из БД для обогащения промпта
 */
export async function generateCategorySeoTextAction(
  categoryName: string,
  categoryId?: number
): Promise<GenerateTextResult> {
  try {
    // Валидация входных данных
    if (!categoryName || categoryName.trim().length === 0) {
      return {
        success: false,
        error: 'Укажите название категории',
      }
    }

    // Собираем реальные данные из БД если есть categoryId
    let contextData: CategoryContextData | undefined

    if (categoryId) {
      const machines = await prisma.machine.findMany({
        where: { categoryId },
        select: {
          title: true,
          liftingCapacity: true,
          boomLength: true,
          operatingWeight: true,
        },
      })

      if (machines.length > 0) {
        // Агрегируем данные
        const capacities = machines
          .map(m => m.liftingCapacity)
          .filter((v): v is number => v !== null)
        
        const booms = machines
          .map(m => m.boomLength)
          .filter((v): v is number => v !== null)
        
        const weights = machines
          .map(m => m.operatingWeight)
          .filter((v): v is number => v !== null)

        // Извлекаем уникальные модели/бренды из названий
        const models = [...new Set(machines.map(m => m.title))]

        contextData = {
          count: machines.length,
          minCapacity: capacities.length > 0 ? Math.min(...capacities) : undefined,
          maxCapacity: capacities.length > 0 ? Math.max(...capacities) : undefined,
          minBoom: booms.length > 0 ? Math.min(...booms) : undefined,
          maxBoom: booms.length > 0 ? Math.max(...booms) : undefined,
          minWeight: weights.length > 0 ? Math.min(...weights) : undefined,
          maxWeight: weights.length > 0 ? Math.max(...weights) : undefined,
          models,
        }
      }
    }

    const text = await generateCategorySeoText(categoryName.trim(), contextData)

    return {
      success: true,
      text,
    }
  } catch (error) {
    console.error('AI category SEO generation error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Неизвестная ошибка при генерации текста'

    return {
      success: false,
      error: errorMessage,
    }
  }
}
