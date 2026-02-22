import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAllAttributes } from '@/lib/actions/attributes'
import AttributesClient from './AttributesClient'

export const dynamic = 'force-dynamic'

export default async function AttributesPage() {
  const attributes = await getAllAttributes()

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Навигация */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin"
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <AttributesClient initialAttributes={attributes} />
      </div>
    </div>
  )
}
