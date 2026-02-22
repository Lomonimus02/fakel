'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toggleReviewVisibility } from '@/lib/actions/reviews'

interface ToggleVisibilityButtonProps {
  id: number
  isVisible: boolean
}

export default function ToggleVisibilityButton({ id, isVisible }: ToggleVisibilityButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [visible, setVisible] = useState(isVisible)

  const handleToggle = async () => {
    setIsUpdating(true)
    
    try {
      const result = await toggleReviewVisibility(id)
      if (result?.error) {
        alert(result.error)
      } else {
        setVisible(!visible)
      }
    } catch (err) {
      console.error('Ошибка обновления:', err)
      alert('Произошла ошибка при обновлении')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isUpdating) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400">
        <Loader2 className="w-3 h-3 animate-spin" />
      </span>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
        visible
          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
      }`}
      title={visible ? 'Скрыть отзыв' : 'Показать отзыв'}
    >
      {visible ? (
        <>
          <Eye className="w-3 h-3" />
          Виден
        </>
      ) : (
        <>
          <EyeOff className="w-3 h-3" />
          Скрыт
        </>
      )}
    </button>
  )
}
