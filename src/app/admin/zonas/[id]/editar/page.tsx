export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ZoneForm from '../../ZoneForm'

export default async function EditZonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const zone = await prisma.deliveryZone.findUnique({ where: { id } })
  if (!zone) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/zonas" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Editar Zona — {zone.name}</h1>
      </div>
      <ZoneForm zone={{
        id: zone.id,
        name: zone.name,
        description: zone.description ?? '',
        deliveryFee: zone.deliveryFee,
        minOrder: zone.minOrder,
        estimatedMin: zone.estimatedMin,
        estimatedMax: zone.estimatedMax,
      }} />
    </div>
  )
}
