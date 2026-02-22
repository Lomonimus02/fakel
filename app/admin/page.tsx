import Link from 'next/link'
import { Settings, Truck, FileText, Building2, Phone, User, MessageSquare, SlidersHorizontal } from 'lucide-react'
import { logout } from '@/lib/auth'

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
            <p className="text-gray-400 mt-1">Planteo — управление сайтом</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Выйти
            </button>
          </form>
        </div>

        {/* Карточки разделов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Техника */}
          <Link
            href="/admin/machinery"
            className="bg-surface rounded-xl border border-white/10 p-6 hover:border-accent/50 transition-all group"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
              <Truck className="w-6 h-6 text-accent group-hover:text-dark transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Техника</h2>
            <p className="text-gray-400 text-sm">
              Управление каталогом спецтехники: добавление, редактирование, удаление
            </p>
          </Link>

          {/* Заявки */}
          <Link
            href="/admin/leads"
            className="bg-surface rounded-xl border border-white/10 p-6 hover:border-accent/50 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
              <FileText className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Заявки</h2>
            <p className="text-gray-400 text-sm">
              Просмотр и обработка заявок от клиентов
            </p>
          </Link>

          {/* Категории */}
          <Link
            href="/admin/categories"
            className="bg-surface rounded-xl border border-white/10 p-6 hover:border-accent/50 transition-all group"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
              <Settings className="w-6 h-6 text-green-400 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Категории</h2>
            <p className="text-gray-400 text-sm">
              Управление категориями техники
            </p>
          </Link>

          {/* Атрибуты */}
          <Link
            href="/admin/attributes"
            className="bg-surface rounded-xl border border-white/10 p-6 hover:border-accent/50 transition-all group"
          >
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
              <SlidersHorizontal className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Атрибуты</h2>
            <p className="text-gray-400 text-sm">
              Характеристики техники: грузоподъемность, объём ковша и др.
            </p>
          </Link>

          {/* О компании */}
          <Link
            href="/admin/company"
            className="bg-surface rounded-xl border border-white/10 p-6 hover:border-accent/50 transition-all group"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
              <Building2 className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">О компании</h2>
            <p className="text-gray-400 text-sm">
              Фото компании, лицензии и допуски
            </p>
          </Link>

          {/* Отзывы */}
          <Link
            href="/admin/reviews"
            className="bg-surface rounded-xl border border-white/10 p-6 hover:border-accent/50 transition-all group"
          >
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500 transition-colors">
              <MessageSquare className="w-6 h-6 text-yellow-400 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Отзывы</h2>
            <p className="text-gray-400 text-sm">
              Управление отзывами клиентов
            </p>
          </Link>

          {/* Настройки сайта */}
          <Link
            href="/admin/settings"
            className="bg-surface rounded-xl border border-white/10 p-6 hover:border-accent/50 transition-all group"
          >
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
              <Phone className="w-6 h-6 text-orange-400 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Настройки сайта</h2>
            <p className="text-gray-400 text-sm">
              Контакты, телефон, адрес и другие настройки
            </p>
          </Link>

          {/* Профиль */}
          <Link
            href="/admin/profile"
            className="bg-surface rounded-xl border border-white/10 p-6 hover:border-accent/50 transition-all group"
          >
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500 transition-colors">
              <User className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Профиль</h2>
            <p className="text-gray-400 text-sm">
              Смена пароля администратора
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
