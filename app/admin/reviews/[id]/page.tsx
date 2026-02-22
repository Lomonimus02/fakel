import { notFound } from 'next/navigation'
import { getReviewById } from '@/lib/actions/reviews'
import ReviewForm from './ReviewForm'

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReviewEditPage({ params }: Props) {
  const { id } = await params

  // Если id = "new", создаём новый отзыв
  if (id === 'new') {
    return (
      <div className="min-h-screen bg-dark">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold text-white mb-6">
            Добавить отзыв
          </h1>
          <ReviewForm />
        </div>
      </div>
    )
  }

  // Иначе редактируем существующий
  const reviewId = parseInt(id, 10)
  if (isNaN(reviewId)) {
    notFound()
  }

  const review = await getReviewById(reviewId)

  if (!review) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-white mb-6">
          Редактировать отзыв
        </h1>
        <ReviewForm review={review} />
      </div>
    </div>
  )
}
