import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ZoneForm from '../ZoneForm'

export default function NewZonePage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/zonas" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Nueva Zona</h1>
      </div>
      <ZoneForm />
    </div>
  )
}
