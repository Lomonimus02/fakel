'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

/** Заглушка по умолчанию */
const FALLBACK_SRC = '/placeholder.svg'

/**
 * Обёртка над next/image, которая автоматически:
 * - Использует unoptimized для localhost/private URLs (dev-режим)
 * - Применяет оптимизацию для production S3 URLs
 * - Показывает заглушку при битом/недоступном изображении
 */
export function OptimizedImage({ src, alt, onError, ...props }: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Проверяем, является ли URL локальным (dev-режим с MinIO)
  const isLocalUrl = typeof imgSrc === 'string' && (
    imgSrc.startsWith('http://localhost') ||
    imgSrc.startsWith('http://127.0.0.1') ||
    imgSrc.startsWith('http://minio')
  )
  
  return (
    <Image
      src={hasError ? FALLBACK_SRC : imgSrc}
      alt={alt}
      unoptimized={isLocalUrl || hasError}
      onError={(e) => {
        if (!hasError) {
          setHasError(true)
          setImgSrc(FALLBACK_SRC)
        }
        onError?.(e)
      }}
      {...props}
    />
  )
}
