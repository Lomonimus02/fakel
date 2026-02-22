'use server'

import { uploadFileToS3 } from '@/lib/s3'

// Максимальный размер файла по умолчанию: 5 MB
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024

// Белый список допустимых MIME-типов
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
])

/**
 * Загружает файл в S3-совместимое хранилище
 * @param formData - FormData с файлом в поле 'file'
 * @param folder - Папка для загрузки (по умолчанию 'uploads')
 * @param maxFileSize - Максимальный размер файла в байтах (по умолчанию 5 МБ)
 * @returns Полный публичный URL файла или null при ошибке
 */
export async function uploadFile(
  formData: FormData,
  folder: string = 'uploads',
  maxFileSize: number = DEFAULT_MAX_FILE_SIZE
): Promise<string | null> {
  const file = formData.get('file') as File | null
  
  if (!file || file.size === 0) {
    return null
  }

  // Проверка MIME-типа
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      `Недопустимый тип файла: ${file.type || 'unknown'}. Разрешены: JPG, PNG, WebP, GIF, SVG, PDF.`
    )
  }

  // Проверка размера файла
  if (file.size > maxFileSize) {
    const maxMb = Math.round(maxFileSize / 1024 / 1024)
    throw new Error(`Файл слишком большой. Максимальный размер ${maxMb} МБ.`)
  }

  try {
    // Загружаем файл в S3
    const publicUrl = await uploadFileToS3(file, folder)
    return publicUrl
  } catch (error) {
    console.error('Ошибка загрузки файла в S3:', error)
    return null
  }
}
