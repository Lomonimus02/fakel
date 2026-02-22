'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2, Upload, FileText, X } from 'lucide-react'
import { createReview, updateReview, deleteReview } from '@/lib/actions/reviews'
import { uploadFile } from '@/lib/actions/upload'

interface Review {
  id: number
  author: string
  role: string | null
  text: string
  rating: number
  isVisible: boolean
  scanUrl: string | null
}

interface ReviewFormProps {
  review?: Review
}

export default function ReviewForm({ review }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState(review?.rating || 5)
  const [isVisible, setIsVisible] = useState(review?.isVisible ?? true)
  const [scanUrl, setScanUrl] = useState<string | null>(review?.scanUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!review

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Допустимые форматы: JPG, PNG, WebP, GIF, PDF')
      return
    }
    
    // Проверяем размер (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Максимальный размер файла: 5 МБ')
      return
    }
    
    setIsUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      const url = await uploadFile(formData, 'reviews')
      
      if (url) {
        setScanUrl(url)
      } else {
        setError('Ошибка загрузки файла')
      }
    } catch (err) {
      console.error('Ошибка загрузки:', err)
      setError('Ошибка загрузки файла')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveScan = () => {
    setScanUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!review) return
    
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв? Это действие необратимо.')) {
      return
    }
    
    setIsDeleting(true)
    setError(null)
    
    try {
      const result = await deleteReview(review.id)
      if (result?.error) {
        setError(result.error)
        setIsDeleting(false)
      }
    } catch (err: unknown) {
      // NEXT_REDIRECT - это нормальное поведение
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        return
      }
      console.error('Ошибка удаления:', err)
      setError('Произошла ошибка при удалении')
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Добавляем rating, isVisible и scanUrl в formData
      formData.set('rating', rating.toString())
      formData.set('isVisible', isVisible.toString())
      formData.set('scanUrl', scanUrl || '')
      
      let result
      if (isEditing) {
        result = await updateReview(review.id, formData)
      } else {
        result = await createReview(formData)
      }
      
      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
      }
    } catch (err: unknown) {
      // NEXT_REDIRECT - это нормальное поведение, не ошибка
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        return // redirect сработает
      }
      console.error('Ошибка сохранения:', err)
      setError('Произошла ошибка при сохранении')
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Навигация */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/reviews"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </Link>
        <div className="flex items-center gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Удалить
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accent-hover text-dark font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Форма */}
      <div className="bg-surface rounded-xl border border-white/10 p-6 space-y-6">
        {/* Автор */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Имя автора / компании *
          </label>
          <input
            type="text"
            name="author"
            defaultValue={review?.author || ''}
            required
            className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
            placeholder="Иван Петров"
          />
        </div>

        {/* Должность */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Должность / компания
          </label>
          <input
            type="text"
            name="role"
            defaultValue={review?.role || ''}
            className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
            placeholder="Гл. инженер ООО СтройТрест"
          />
        </div>

        {/* Текст отзыва */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Текст отзыва *
          </label>
          <textarea
            name="text"
            defaultValue={review?.text || ''}
            required
            rows={5}
            className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="Арендовали автокран для монтажа конструкций. Техника пришла вовремя, оператор профессионал. Рекомендуем!"
          />
        </div>

        {/* Оценка */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Оценка
          </label>
          <select
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value, 10))}
            className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
          >
            <option value={5}>★★★★★ (5)</option>
            <option value={4}>★★★★☆ (4)</option>
            <option value={3}>★★★☆☆ (3)</option>
            <option value={2}>★★☆☆☆ (2)</option>
            <option value={1}>★☆☆☆☆ (1)</option>
          </select>
        </div>

        {/* Скан благодарственного письма */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Скан письма (IMG/PDF)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Загрузите скан благодарственного письма или отзыва с печатью для повышения доверия
          </p>
          
          {scanUrl ? (
            <div className="flex items-center gap-4 p-4 bg-dark border border-white/10 rounded-lg">
              {/* Превью или иконка */}
              {scanUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img 
                  src={scanUrl} 
                  alt="Скан письма" 
                  className="w-16 h-16 object-cover rounded-lg border border-white/10"
                />
              ) : (
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-accent" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">Файл загружен</p>
                <a 
                  href={scanUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  Открыть в новой вкладке
                </a>
              </div>
              
              <button
                type="button"
                onClick={handleRemoveScan}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Удалить файл"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
              />
              <div className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg transition-colors ${
                isUploading 
                  ? 'border-accent/50 bg-accent/5' 
                  : 'border-white/20 hover:border-accent/50 hover:bg-white/5'
              }`}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    <span className="text-gray-400">Загрузка...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-400">Нажмите для загрузки или перетащите файл</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Видимость */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
          <span className="text-sm text-gray-300">
            Показывать на сайте
          </span>
        </div>
      </div>
    </form>
  )
}
