import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// S3-compatible клиент (MinIO, Timeweb, AWS S3)
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true, // Необходимо для MinIO и некоторых S3-совместимых хранилищ
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || ''

/**
 * Загружает файл в S3-совместимое хранилище
 * @param file - File объект для загрузки
 * @param folder - Папка в бакете (например, 'machinery', 'categories')
 * @returns Полный публичный URL загруженного файла
 */
export async function uploadFileToS3(file: File, folder: string): Promise<string> {
  // Генерируем уникальное имя файла
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${timestamp}_${randomSuffix}_${originalName}`
  
  // Полный путь в бакете
  const key = folder ? `${folder}/${fileName}` : fileName
  
  // Читаем файл в Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // Определяем Content-Type
  const contentType = file.type || 'application/octet-stream'
  
  // Загружаем в S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // Делаем файл публичным для чтения
    ACL: 'public-read',
  })
  
  await s3Client.send(command)
  
  // Формируем публичный URL
  const endpoint = process.env.S3_ENDPOINT || ''
  // Убираем trailing slash если есть
  const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
  
  // Для path-style URL: endpoint/bucket/key
  // Для virtual-hosted style: bucket.endpoint/key
  // Используем path-style для совместимости
  const publicUrl = `${baseUrl}/${BUCKET_NAME}/${key}`
  
  return publicUrl
}

/**
 * Получает хост из S3_ENDPOINT для настройки next/image remotePatterns
 */
export function getS3Hostname(): string | null {
  const endpoint = process.env.S3_ENDPOINT
  if (!endpoint) return null
  
  try {
    const url = new URL(endpoint)
    return url.hostname
  } catch {
    return null
  }
}

export { s3Client, BUCKET_NAME }
