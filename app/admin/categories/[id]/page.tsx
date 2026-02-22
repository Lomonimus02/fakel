import { notFound } from 'next/navigation'
import { getCategoryById, getAllCategories, getRelatedCategories } from '@/lib/actions/categories'
import { getAllAttributes, getCategoryAttributes } from '@/lib/actions/attributes'
import CategoryForm from './CategoryForm'

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>
}

export default async function CategoryEditPage({ params }: Props) {
  const { id } = await params
  
  // Получаем все доступные атрибуты и категории
  const [allAttributes, allCategories] = await Promise.all([
    getAllAttributes(),
    getAllCategories()
  ])

  // Если id = "new", создаём новую категорию
  if (id === 'new') {
    return (
      <div className="min-h-screen bg-dark">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold text-white mb-6">
            Добавить категорию
          </h1>
          <CategoryForm 
            allAttributes={allAttributes} 
            categoryAttributes={[]} 
            allCategories={allCategories}
            relatedCategoryIds={[]}
          />
        </div>
      </div>
    )
  }

  // Иначе редактируем существующую
  const categoryId = parseInt(id, 10)
  if (isNaN(categoryId)) {
    notFound()
  }

  const [category, categoryAttributes, relatedCategories] = await Promise.all([
    getCategoryById(categoryId),
    getCategoryAttributes(categoryId),
    getRelatedCategories(categoryId)
  ])

  if (!category) {
    notFound()
  }

  // ID связанных категорий для формы
  const relatedCategoryIds = relatedCategories.map(c => c.id)

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-white mb-6">
          Редактировать: {category.name}
        </h1>
        <CategoryForm 
          category={category} 
          allAttributes={allAttributes}
          categoryAttributes={categoryAttributes}
          allCategories={allCategories}
          relatedCategoryIds={relatedCategoryIds}
        />
      </div>
    </div>
  )
}
