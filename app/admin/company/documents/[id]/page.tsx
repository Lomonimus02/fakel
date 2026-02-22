import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getDocument } from '@/lib/actions/company'
import { DocumentForm } from '../DocumentForm'

export const dynamic = 'force-dynamic';

interface EditDocumentPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id } = await params
  const document = await getDocument(parseInt(id))

  if (!document) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Шапка */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/company"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Редактировать документ</h1>
            <p className="text-gray-400 mt-1">{document.title}</p>
          </div>
        </div>

        <DocumentForm document={document} />
      </div>
    </div>
  )
}
