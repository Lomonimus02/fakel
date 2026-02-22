import Link from 'next/link'
import { Plus, ArrowLeft, MessageSquare, Star } from 'lucide-react'
import { getAllReviews } from '@/lib/actions/reviews'
import DeleteReviewButton from './DeleteReviewButton'
import ToggleVisibilityButton from './ToggleVisibilityButton'

export const dynamic = 'force-dynamic';

type Review = {
  id: number
  author: string
  role: string | null
  text: string
  rating: number
  isVisible: boolean
  createdAt: Date
}

export default async function ReviewsListPage() {
  const reviews = await getAllReviews()

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Отзывы</h1>
              <p className="text-gray-400 mt-1">
                Всего отзывов: {reviews.length}
              </p>
            </div>
          </div>
          <Link
            href="/admin/reviews/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-dark font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Добавить
          </Link>
        </div>

        {/* Таблица */}
        <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
          {reviews.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Отзывы пока не добавлены</p>
              <Link
                href="/admin/reviews/new"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium"
              >
                <Plus className="w-4 h-4" />
                Добавить первый отзыв
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-dark/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Автор
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Отзыв
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Оценка
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {reviews.map((review: Review) => (
                  <tr key={review.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {review.author}
                      </div>
                      {review.role && (
                        <div className="text-sm text-gray-500">
                          {review.role}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 max-w-md truncate">
                        {review.text}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-medium">{review.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ToggleVisibilityButton 
                        id={review.id} 
                        isVisible={review.isVisible} 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/reviews/${review.id}`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <DeleteReviewButton id={review.id} author={review.author} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
