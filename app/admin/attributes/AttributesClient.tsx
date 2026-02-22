'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { 
  createAttribute, 
  updateAttribute, 
  deleteAttribute 
} from '@/lib/actions/attributes'

type Attribute = {
  id: number
  name: string
  slug: string
  type: string
  unit: string | null
  _count: {
    categories: number
    values: number
  }
}

interface AttributesClientProps {
  initialAttributes: Attribute[]
}

const ATTRIBUTE_TYPES = [
  { value: 'number', label: 'Число', description: 'Для числовых значений (вес, длина и т.д.)' },
  { value: 'string', label: 'Строка', description: 'Для текстовых значений' },
  { value: 'select', label: 'Выбор', description: 'Для предопределённых значений' },
]

export default function AttributesClient({ initialAttributes }: AttributesClientProps) {
  const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openCreateModal = () => {
    setEditingAttribute(null)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (attribute: Attribute) => {
    setEditingAttribute(attribute)
    setError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAttribute(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      let result
      if (editingAttribute) {
        result = await updateAttribute(editingAttribute.id, formData)
      } else {
        result = await createAttribute(formData)
      }

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Обновляем локальный список
      if (editingAttribute && result.attribute) {
        setAttributes(prev => 
          prev.map(a => a.id === editingAttribute.id 
            ? { ...a, ...result.attribute } 
            : a
          )
        )
      } else if (result.attribute) {
        setAttributes(prev => [...prev, { 
          ...result.attribute, 
          _count: { categories: 0, values: 0 } 
        } as Attribute])
      }

      closeModal()
    } catch (err) {
      console.error('Error:', err)
      setError('Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (attribute: Attribute) => {
    if (attribute._count.values > 0) {
      alert(`Невозможно удалить. Атрибут используется в ${attribute._count.values} товарах.`)
      return
    }

    if (!window.confirm(`Удалить атрибут "${attribute.name}"?`)) {
      return
    }

    setDeletingId(attribute.id)

    try {
      const result = await deleteAttribute(attribute.id)
      
      if (result.error) {
        alert(result.error)
      } else {
        setAttributes(prev => prev.filter(a => a.id !== attribute.id))
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Ошибка при удалении')
    } finally {
      setDeletingId(null)
    }
  }

  const getTypeLabel = (type: string) => {
    return ATTRIBUTE_TYPES.find(t => t.value === type)?.label || type
  }

  return (
    <>
      {/* Шапка */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Атрибуты</h1>
          <p className="text-gray-400 mt-1">
            Характеристики техники: {attributes.length}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-dark font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить
        </button>
      </div>

      {/* Таблица */}
      <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
        {attributes.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 mb-4">Атрибуты пока не добавлены</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium"
            >
              <Plus className="w-4 h-4" />
              Добавить первый атрибут
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-dark/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Единица
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Использование
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {attributes.map((attribute) => (
                <tr key={attribute.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-white">{attribute.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-400 bg-dark px-2 py-1 rounded">
                      {attribute.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {getTypeLabel(attribute.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {attribute.unit || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400">
                      <span title="Категорий">{attribute._count.categories} кат.</span>
                      {' / '}
                      <span title="Товаров">{attribute._count.values} тов.</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(attribute)}
                        className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(attribute)}
                        disabled={deletingId === attribute.id}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Удалить"
                      >
                        {deletingId === attribute.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-surface rounded-xl border border-white/10 w-full max-w-md p-6">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
              {editingAttribute ? 'Редактировать атрибут' : 'Новый атрибут'}
            </h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Название */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Название *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingAttribute?.name || ''}
                  placeholder="Грузоподъемность"
                  className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              {/* Slug (только при создании) */}
              {!editingAttribute && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slug <span className="text-gray-500 font-normal">(авто)</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    placeholder="lifting_capacity"
                    className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Оставьте пустым для автогенерации
                  </p>
                </div>
              )}

              {/* Тип */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Тип *
                </label>
                <select
                  name="type"
                  required
                  defaultValue={editingAttribute?.type || 'number'}
                  className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  {ATTRIBUTE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} — {type.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Единица измерения */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Единица измерения
                </label>
                <input
                  type="text"
                  name="unit"
                  defaultValue={editingAttribute?.unit || ''}
                  placeholder="т, м, м³"
                  className="w-full px-4 py-2.5 bg-dark border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              {/* Кнопки */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-dark font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
