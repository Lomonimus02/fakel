'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

// Максимальный размер файла: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

interface ImageUploadProps {
  currentImage?: string | null
  name?: string
}

export default function ImageUpload({ currentImage, name = 'image' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [hasNewFile, setHasNewFile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Клиентская валидация размера
      if (file.size > MAX_FILE_SIZE) {
        alert('Файл слишком большой. Максимум 5 МБ')
        e.target.value = ''
        return
      }
      
      setHasNewFile(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setHasNewFile(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // Определяем, какой currentImageUrl передавать:
  // - Если загрузили новый файл - пустая строка (сервер возьмёт новый файл)
  // - Если удалили превью - пустая строка (фото удалено)
  // - Иначе - текущий URL
  const currentImageUrlValue = hasNewFile ? '' : (preview ? (currentImage || '') : '')

  return (
    <div className="space-y-3">
      {/* Скрытый input для сохранения текущего URL */}
      <input type="hidden" name="currentImageUrl" value={currentImageUrlValue} />

      {/* File input (единственный) */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        id={`file-upload-${name}`}
      />

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Превью"
            className="w-48 h-48 object-cover rounded-lg border border-white/20"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Удалить"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label 
          htmlFor={`file-upload-${name}`}
          className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
        >
          <ImageIcon className="w-10 h-10 text-gray-500 mb-2" />
          <span className="text-sm text-gray-400">Нажмите для загрузки</span>
        </label>
      )}

      {preview && (
        <label 
          htmlFor={`file-upload-${name}`}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-accent hover:text-accent-hover hover:bg-accent/10 rounded-lg cursor-pointer transition-colors"
        >
          <Upload className="w-4 h-4" />
          Заменить фото
        </label>
      )}
    </div>
  )
}
