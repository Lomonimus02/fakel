'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteReview } from '@/lib/actions/reviews'

interface DeleteReviewButtonProps {
  id: number
  author: string
}

export default function DeleteReviewButton({ id, author }: DeleteReviewButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Вы уверены, что хотите удалить отзыв от "${author}"?`)) {
      return
    }

    setIsDeleting(true)
    
    try {
      const result = await deleteReview(id)
      if (result?.error) {
        alert(result.error)
        setIsDeleting(false)
      }
    } catch (err: unknown) {
      // NEXT_REDIRECT - это нормальное поведение
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        return
      }
      console.error('Ошибка удаления:', err)
      alert('Произошла ошибка при удалении')
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
      title="Удалить"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  )
}
